const { EmbedBuilder, Colors, PermissionsBitField } = require("discord.js");

module.exports = {
    name: "unban",
    description: "Bir kullanıcının yasağını kaldırır.",
    options: [
        {
            name: "kullanıcı_id",
            description: "Yasağı kaldırılacak kullanıcının ID'si.",
            type: 3, 
            required: true
        },
        {
            name: "sebep",
            description: "Yasak kaldırma sebebi.",
            type: 3, 
            required: false
        }
    ],
    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.reply({ content: "Üyelerin yasağını kaldırmak için izniniz yok.", ephemeral: true });
        }

        const targetUserId = interaction.options.getString("kullanıcı_id"); 
        const reason = interaction.options.getString("sebep") || "Sebep belirtilmedi.";

        try {
            await interaction.guild.members.unban(targetUserId, reason);
            const embed = new EmbedBuilder()
                .setColor(Colors.Green)
                .setDescription(`**ID'si ${targetUserId} olan kullanıcının yasağı kaldırıldı.**\nSebep: ${reason}`)
                .setImage('https://i.hizliresim.com/oekcos5.gif')
                .setTimestamp();
            return interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error("Üyenin yasağı kaldırılırken hata oluştu:", error);
            return interaction.reply({ content: "Üyenin yasağı kaldırılmaya çalışılırken bir hata oluştu.", ephemeral: true });
        }
    },
};
