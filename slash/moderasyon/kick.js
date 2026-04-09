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
        const botMember = interaction.guild.members.cache.get(client.user.id);
        const targetMemberRoles = targetMember.roles.highest.position;
        const botRole = botMember.roles.highest.position;
        const userRole = interaction.member.roles.highest.position;

        if (targetMemberRoles >= botRole) {
            return interaction.reply({ content: "Bu kullanıcıyı atamazsınız çünkü rolü benim rolümden yüksek veya eşit.", ephemeral: true });
        }

        if (targetMemberRoles >= userRole) {
            return interaction.reply({ content: "Kendinizden yüksek veya eşit role sahip bir üyeyi atamazsınız.", ephemeral: true });
        }
        const reason = interaction.options.getString("sebep") || "Sebep belirtilmedi.";

        try {
            await targetMember.kick(reason);
            const embed = new EmbedBuilder()
                .setColor(Colors.Orange)
                .setDescription(`**${targetUser.tag} atıldı.**\nSebep: ${reason}`)
                .setImage('https://i.imgur.com/wkfbyva.gif')
                .setTimestamp();
            return interaction.reply({ embeds: [embed] });

        } catch (error) {
            if (error.code === 50013) {
                console.error("Üye atılırken hata oluştu: Botun yetkisi yetersiz.");
                interaction.reply({ content: "Üye atılmaya çalışılırken bir hata oluştu: Botun yetkisi yetersiz.", ephemeral: true });
            } else {
                console.error("Üye atılırken hata oluştu:", error);
                interaction.reply({ content: "Üye atılmaya çalışılırken bir hata oluştu.", ephemeral: true });
            }
        }
    },
};
