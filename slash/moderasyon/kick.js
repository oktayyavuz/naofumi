const { EmbedBuilder, Colors, PermissionsBitField } = require("discord.js");

module.exports = {
    name: "kick",
    description: "Bir kullanıcıyı sunucudan atar.",
    options: [
        {
            name: "kullanıcı",
            description: "Atılacak kullanıcı.",
            type: 6, 
            required: true
        },
        {
            name: "sebep",
            description: "Atma sebebi.",
            type: 3, 
            required: false
        }
    ],
    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return interaction.reply({ content: "Üyeleri atmak için izniniz yok.", ephemeral: true });
        }

        const targetUser = interaction.options.getUser("kullanıcı");
        const targetMember = await interaction.guild.members.fetch(targetUser.id); 

        if (targetMember.roles.highest.position >= interaction.member.roles.highest.position) {
            return interaction.reply({ content: "Kendinizden yüksek veya eşit role sahip bir üyeyi atamazsınız.", ephemeral: true });
        }
    const botMember = message.guild.members.cache.get(client.user.id);

    if (targetUser.roles.highest.position >= botMember.roles.highest.position) {
        return message.reply("Bu kullanıcıyı atamazsınız çünkü rolü benim rolümden yüksek veya eşit.");
    }

    if (targetUser.roles.highest.position >= message.member.roles.highest.position) {
        return message.reply("Kendinizden yüksek veya eşit role sahip bir üyeyi atamazsınız.");
    }
        const reason = interaction.options.getString("sebep") || "Sebep belirtilmedi.";

        try {
            await targetMember.kick(reason);
            const embed = new EmbedBuilder()
                .setColor(Colors.Orange)
                .setDescription(`**${targetUser.tag} atıldı.**\nSebep: ${reason}`)
                .setImage('https://i.hizliresim.com/oekcos5.gif')
                .setTimestamp();
            return interaction.reply({ embeds: [embed] });

        } catch (error) {
            if (error.code === 50013) { 
                console.error("Üye atılırken hata oluştu: Botun yetkisi yetersiz.");
                message.reply("Üye atılmaya çalışılırken bir hata oluştu: Botun yetkisi yetersiz.");
            } else {
                console.error("Üye atılırken hata oluştu:", error);
                message.reply("Üye atılmaya çalışılırken bir hata oluştu.");
            }
        }
    },
};
