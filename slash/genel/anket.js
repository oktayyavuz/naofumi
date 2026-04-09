const { EmbedBuilder, PermissionsBitField, Colors } = require("discord.js");

module.exports = {
    name: "anket",
    description: "Basit bir anket oluşturur.",
    options: [
        {
            name: "soru",
            description: "Anket sorusu",
            type: 3, // STRING
            required: true
        }
    ],
    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ content: "Bu komutu kullanmak için 'Mesajları Yönet' yetkisine sahip olmalısınız.", ephemeral: true });
        }

        const question = interaction.options.getString("soru");

        const embed = new EmbedBuilder()
            .setTitle("📊 Anket")
            .setDescription(question)
            .setColor(Colors.Blue)
            .setTimestamp()
            .setFooter({ text: `${interaction.user.tag} tarafından oluşturuldu.`, iconURL: interaction.user.displayAvatarURL() });

        const message = await interaction.reply({ embeds: [embed], fetchReply: true });
        await message.react("👍");
        await message.react("👎");
    }
};
