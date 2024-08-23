const { EmbedBuilder, Colors } = require("discord.js");
const client = require("../../index.js");
const { prefix } = require("../../config.js");

client.on('messageCreate', message => {
    if (message.author.bot || message.content.startsWith(prefix)) return;
});

exports.run = async (client, message) => {
    const guild = message.guild;

    if (!guild.banner) {
        return message.reply("Bu sunucunun bir banner'ı yok.");
    }

    const embed = new EmbedBuilder()
        .setColor(Colors.Blue)
        .setTitle(`${guild.name} Sunucu Banner`)
        .setImage(guild.bannerURL({ size: 1024 }))
        .setFooter({ text: `Sunucu ID: ${guild.id}` })
        .setTimestamp();

    message.reply({ embeds: [embed] });
};

exports.conf = {
    aliases: ["serverbanner"],
};

exports.help = {
    name: "sunucubanner",
};
