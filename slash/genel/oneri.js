const { EmbedBuilder, Colors } = require("discord.js");
const db = require("croxydb");

module.exports = {
    name: "öneri",
    description: "Sunucu için bir öneride bulunursunuz.",
    options: [
        {
            name: "öneri",
            description: "Öneriniz nedir?",
            type: 3, // STRING
            required: true
        }
    ],
    run: async (client, interaction) => {
        const suggestionChannelId = db.get(`suggestionChannel_${interaction.guild.id}`);
        if (!suggestionChannelId) {
            return interaction.reply({ content: "Bu sunucuda öneri kanalı ayarlanmamış. Yetkililer `/öneri-ayarla` komutunu kullanmalı.", ephemeral: true });
        }

        const suggestionChannel = interaction.guild.channels.cache.get(suggestionChannelId);
        if (!suggestionChannel) {
            return interaction.reply({ content: "Öneri kanalı bulunamadı. Lütfen tekrar ayarlayın.", ephemeral: true });
        }

        const suggestion = interaction.options.getString("öneri");

        const embed = new EmbedBuilder()
            .setTitle("💡 Yeni Öneri")
            .setDescription(suggestion)
            .setColor(Colors.Yellow)
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp()
            .setFooter({ text: "Önerinizi oylayarak destek olabilirsiniz!" });

        const message = await suggestionChannel.send({ embeds: [embed] });
        await message.react("✅");
        await message.react("❌");

        await interaction.reply({ content: "Öneriniz başarıyla gönderildi!", ephemeral: true });
    }
};
