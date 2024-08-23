const { StringSelectMenuBuilder, ActionRowBuilder, ComponentType, EmbedBuilder ,PermissionsBitField} = require('discord.js');
const db = require('croxydb');

exports.run = async (client, message, args) => {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return message.reply("Bu komutu kullanmak için yönetici yetkisine sahip olmalısınız.");
    }

    const getOptions = () => [
        {
            label: 'Küfür Engel',
            description: 'Küfür engelleme sistemini aç/kapat.',
            value: 'kufur_engel',
            emoji: db.get(`kufur_engel_${message.guild.id}`) ? '✅' : '🚫',
        },
        {
            label: 'Caps Lock Engel',
            description: 'Caps lock engelleme sistemini aç/kapat.',
            value: 'capslock_engel',
            emoji: db.get(`capslock_engel_${message.guild.id}`) ? '✅' : '🔡',
        },
        {
            label: 'Spam Koruması',
            description: 'Spam koruma sistemini aç/kapat.',
            value: 'spam_koruma',
            emoji: db.get(`spam_koruma_${message.guild.id}`) ? '✅' : '⚠️',
        },
        {
            label: 'Link Engel',
            description: 'Link engelleme sistemini aç/kapat.',
            value: 'link_engel',
            emoji: db.get(`link_engel_${message.guild.id}`) ? '✅' : '🔗',
        },
        {
            label: 'Tümünü Aç/Kapat',
            description: 'Tüm koruma sistemlerini aç/kapat.',
            value: 'toggle_all',
            emoji: '🔄',
        }
    ];

    const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('koruma_sistemi')
            .setPlaceholder('Bir koruma sistemi seçin')
            .addOptions(getOptions())
    );

    const embed = new EmbedBuilder()
        .setTitle('🛡️ Koruma Sistemi Ayarları')
        .setDescription('Aşağıdaki menüden koruma sistemlerini açabilir veya kapatabilirsiniz.')
        .setColor('#0099ff')
        .setThumbnail(message.guild.iconURL({ dynamic: true }))
        .setFooter({ text: `Komut ${message.author.tag} tarafından kullanıldı`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

    const msg = await message.reply({ embeds: [embed], components: [row] });

    const filter = i => i.customId === 'koruma_sistemi' && i.user.id === message.author.id;
    const collector = msg.createMessageComponentCollector({ filter, componentType: ComponentType.StringSelect, time: 60000 });

    collector.on('collect', async i => {
        const selected = i.values[0];

        if (selected === 'toggle_all') {
            const allEnabled = getOptions().some(option => db.get(`${option.value}_${message.guild.id}`));
            const newStatus = !allEnabled;

            getOptions().forEach(option => {
                if (option.value !== 'toggle_all') {
                    if (newStatus) {
                        db.set(`${option.value}_${message.guild.id}`, true);
                    } else {
                        db.delete(`${option.value}_${message.guild.id}`);
                    }
                }
            });

            await i.reply({ content: `Tüm sistemler **${newStatus ? 'açıldı' : 'kapatıldı'}**!`, ephemeral: true });

        } else {
            let status = db.get(`${selected}_${message.guild.id}`);
            const newStatus = !status;

            if (newStatus) {
                db.set(`${selected}_${message.guild.id}`, true);
            } else {
                db.delete(`${selected}_${message.guild.id}`);
            }

            const systemName = getOptions().find(option => option.value === selected).label;
            await i.reply({ content: `${systemName} sistemi **${newStatus ? 'açıldı' : 'kapatıldı'}**!`, ephemeral: true });
        }

        const updatedRow = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('koruma_sistemi')
                .setPlaceholder('Bir koruma sistemi seçin')
                .addOptions(getOptions())
        );
        await msg.edit({ components: [updatedRow] });
    });

    collector.on('end', collected => {
        if (!collected.size) {
            msg.edit({ components: [] });
        }
    });
};

exports.conf = {
    aliases: ['koruma'],
};

exports.help = {
    name: 'koruma',
};
