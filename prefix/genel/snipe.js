const { EmbedBuilder, Colors } = require("discord.js");
let lastDeletedMessage = null;

const client = require("../../index.js");

client.on('messageDelete', message => {
    if (message.partial || message.author.bot) return;
    lastDeletedMessage = message;
});

exports.run = async (client, message, args) => {
    if (!lastDeletedMessage) {
        return message.reply("Bu kanalda henüz silinen bir mesaj bulunmuyor.");
    }

    const embed = new EmbedBuilder()
        .setColor(Colors.Yellow)
        .setAuthor({ name: lastDeletedMessage.author.tag, iconURL: lastDeletedMessage.author.displayAvatarURL() })
        .setFooter({ text: `Kanal: #${lastDeletedMessage.channel.name}` })
        .setTimestamp();

    let hasImage = false;

    if (lastDeletedMessage.content) {
        embed.setDescription(lastDeletedMessage.content);

        const urlRegex = /(https?:\/\/[^\s]+\.(?:png|jpg|jpeg|gif))/i;
        const match = lastDeletedMessage.content.match(urlRegex);
        if (match) {
            embed.setImage(match[0]);
            hasImage = true;
        }
    }

    if (lastDeletedMessage.attachments.size > 0) {
        const attachment = lastDeletedMessage.attachments.first();
        if (attachment && attachment.url) {
            embed.setImage(attachment.url);
            hasImage = true;
        }
    }

    if (!lastDeletedMessage.content && !hasImage) {
        embed.setDescription("*Mesaj içeriği yok*");
    } else if (!lastDeletedMessage.content && hasImage) {
        embed.setDescription("*Bir görsel eklenmişti.*");
    }

    message.reply({ embeds: [embed] });
};

exports.conf = {
    aliases: ["snipe","sp","sonmesaj"]
};

exports.help = {
    name: "snipe"
};