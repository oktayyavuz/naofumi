const { PermissionsBitField, ChannelType, EmbedBuilder, Colors } = require("discord.js");
const db = require("croxydb");

module.exports = {
    name: "öneri-ayarla",
    description: "Öneri kanalını ayarlar.",
    options: [
        {
            name: "kanal",
            description: "Önerilerin gideceği kanal",
            type: 7, // CHANNEL
            channel_types: [0], // GuildText
            required: true
        }
    ],
    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: "Bu komutu kullanmak için 'Yönetici' yetkisine sahip olmalısınız.", ephemeral: true });
        }

        const channel = interaction.options.getChannel("kanal");
        db.set(`suggestionChannel_${interaction.guild.id}`, channel.id);

        const embed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setDescription(`✅ Öneri kanalı başarıyla ${channel} olarak ayarlandı.`);

        await interaction.reply({ embeds: [embed] });
    }
};
