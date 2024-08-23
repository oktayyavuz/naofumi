const { EmbedBuilder, Colors, PermissionsBitField } = require("discord.js");

module.exports = {
    name: "ban",
    description: "Bir kullanıcıyı sunucudan yasaklar.",
    options: [
        {
            name: "kullanıcı",
            description: "Yasaklanacak kullanıcı.",
            type: 6, 
            required: true
        },
        {
            name: "sebep",
            description: "Yasaklama sebebi.",
            type: 3, 
            required: false
        }
    ],
    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.reply({ content: "Üyeleri yasaklamak için izniniz yok.", ephemeral: true });
        }

        const targetUser = interaction.options.getUser("kullanıcı");
        const targetMember = await interaction.guild.members.fetch(targetUser.id); 

        if (targetMember.roles.highest.position >= interaction.member.roles.highest.position) {
            return interaction.reply({ content: "Kendinizden yüksek veya eşit role sahip bir üyeyi yasaklayamazsınız.", ephemeral: true });
        }

        const reason = interaction.options.getString("sebep") || "Sebep belirtilmedi.";

        try {
            await targetMember.ban({ reason });
            const embed = new EmbedBuilder()
                .setColor(Colors.Red)
                .setDescription(`**${targetUser.tag} yasaklandı.**\nSebep: ${reason}`)
                .setImage('https://i.hizliresim.com/oekcos5.gif')
                .setTimestamp();
            return interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error("Üye yasaklanırken hata oluştu:", error);
            return interaction.reply({ content: "Üye yasaklanmaya çalışılırken bir hata oluştu.", ephemeral: true });
        }
    },
};
