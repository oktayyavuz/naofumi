const { EmbedBuilder, Colors } = require("discord.js");

exports.run = async (client, message, args) => {
    const ping = Math.round(client.ws.ping);

    const emojiPing = "🏓";
    const emojiOnline = "💻";
    const emojiLoading = "⌛";
    const emojiSuccess = "✅";

    const embed = new EmbedBuilder()
        .setColor(Colors.Green)
        .setTitle(`${emojiPing} Pong!`)
        .setDescription(`${emojiOnline} Botun ping değeri ölçülüyor...`)
        .setTimestamp();

    const sentMessage = await message.reply({ embeds: [embed] });

    setTimeout(() => {
        embed
            .setColor(Colors.Blue)
            .setDescription(`${emojiSuccess} Botun gecikmesi: **${ping}ms**\n${emojiLoading} Mesaj gecikmesi: **${Math.abs(sentMessage.createdTimestamp - message.createdTimestamp)}ms**`)
            .setFooter({ text: `Gecikme bilgisi güncellendi!` });

        sentMessage.edit({ embeds: [embed] });
    }, 1000); 
};

exports.conf = {
    aliases: ["ping", "gecikme", "p"],
};

exports.help = {
    name: "ping",
    description: "Botun ping değerini gösterir.",
    usage: "ping",
};
