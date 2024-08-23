const { StringSelectMenuBuilder, ActionRowBuilder, ComponentType, EmbedBuilder , PermissionsBitField} = require('discord.js');
const db = require('croxydb');

exports.run = async (client, message, args) => {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return message.reply("Bu komutu kullanmak için yönetici yetkisine sahip olmalısınız.");
    }

    const whitelistCategories = ['kufur', 'capslock', 'spam', 'link', 'full'];

    const getOptions = (category) => {
        const whitelistedRoles = db.get(`${category}_whitelist_role_${message.guild.id}`) || [];
        return message.guild.roles.cache
            .filter(role => role.id !== message.guild.id && !role.managed)
            .map(role => ({
                label: role.name,
                description: whitelistedRoles.includes(role.id) ? 'Whitelist\'ten çıkar' : 'Whitelist\'e ekle',
                value: `${category}_${role.id}`,
                emoji: whitelistedRoles.includes(role.id) ? '✅' : '➕',
            }))
            .slice(0, 25);
    };

    const rows = whitelistCategories.map(category => 
        new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(`whitelist_role_${category}`)
                .setPlaceholder(`Bir rol seçin (${category} koruması)`)
                .addOptions(getOptions(category))
        )
    );

    const embed = new EmbedBuilder()
        .setTitle('🛡️ Whitelist Rol Ayarları')
        .setDescription('Aşağıdaki menülerden whitelist\'e eklemek veya çıkarmak istediğiniz rolleri seçin.')
        .setColor('#0099ff')
        .setFooter({ text: `Komut ${message.author.tag} tarafından kullanıldı`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

    const msg = await message.reply({ embeds: [embed], components: rows });

    const filter = i => whitelistCategories.some(category => i.customId === `whitelist_role_${category}`) && i.user.id === message.author.id;
    const collector = msg.createMessageComponentCollector({ filter, componentType: ComponentType.StringSelect, time: 60000 });

    collector.on('collect', async i => {
        const [category, roleId] = i.values[0].split('_');
        const whitelistedRoles = db.get(`${category}_whitelist_role_${message.guild.id}`) || [];
        const role = message.guild.roles.cache.get(roleId);

        if (whitelistedRoles.includes(roleId)) {
            whitelistedRoles.splice(whitelistedRoles.indexOf(roleId), 1);
            await i.reply({ content: `${role.name} rolü ${category} whitelist'inden çıkarıldı.`, ephemeral: true });
        } else {
            whitelistedRoles.push(roleId);
            await i.reply({ content: `${role.name} rolü ${category} whitelist'ine eklendi.`, ephemeral: true });
        }

        db.set(`${category}_whitelist_role_${message.guild.id}`, whitelistedRoles);

        const updatedRows = whitelistCategories.map(cat => 
            new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(`whitelist_role_${cat}`)
                    .setPlaceholder(`Bir rol seçin (${cat} koruması)`)
                    .addOptions(getOptions(cat))
            )
        );

        await msg.edit({ components: updatedRows });
    });

    collector.on('end', collected => {
        if (!collected.size) {
            msg.edit({ content: 'Zaman aşımına uğradı.', components: [] });
        }
    });
};

exports.conf = {
    aliases: ['whitelistrole', 'wlrole'],
};

exports.help = {
    name: 'whitelistrole',
    description: 'Koruma sistemlerinden muaf tutulacak rolleri yönetir.',
    usage: 'whitelistrole'
};
