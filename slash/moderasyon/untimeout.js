const { EmbedBuilder, Colors, PermissionsBitField } = require("discord.js");

module.exports = {
    name: "untimeout",
    description: "Bir kullanıcının timeout'unu (susturmasını) kaldırır.",
    options: [
        {
            name: "kullanıcı",
            description: "Timeout'u kaldırılacak kullanıcı.",
            type: 6, 
            required: true
        },
        {
            name: "sebep",
            description: "Timeout kaldırma sebebi.",
            type: 3, 
            required: false
        }
    ],
    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return interaction.reply({ content: "Üyelerin timeout'unu kaldırmak için izniniz yok.", ephemeral: true });
        }

        const targetUser = interaction.options.getUser("kullanıcı");
        const targetMember = await interaction.guild.members.fetch(targetUser.id); 

        const reason = interaction.options.getString("sebep") || "Sebep belirtilmedi.";

        try {
            await targetMember.timeout(null, reason); 
            const embed = new EmbedBuilder()
                .setColor(Colors.Green)
                .setDescription(`**${targetUser.tag} adlı kullanıcının timeout'u kaldırıldı.**\nSebep: ${reason}`)
                .setImage('https://i.hizliresim.com/oekcos5.gif')
                .setTimestamp();
            return interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error("Üyenin timeout'u kaldırılırken hata oluştu:", error);
            return interaction.reply({ content: "Üyenin timeout'u kaldırılmaya çalışılırken bir hata oluştu.", ephemeral: true });
        }
    },
};
