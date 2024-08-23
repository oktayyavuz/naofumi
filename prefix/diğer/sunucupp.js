const { EmbedBuilder, Colors } = require("discord.js");
const client = require("../../index.js");
const { prefix } = require("../../config.js");

client.on('messageCreate', message => {
    if (message.author.bot || message.content.startsWith(prefix)) return;
});

exports.run = async (client, message) => {
    const guild = message.guild;

    if (!guild.iconURL()) {
        return message.reply("Bu sunucunun bir profil resmi yok.");
    }

    const embed = new EmbedBuilder()
        .setColor(Colors.Blue)
        .setTitle(`${guild.name} Sunucu Profil Resmi`)
        .setImage(guild.iconURL({ dynamic: true, size: 1024 }))
        .setFooter({ text: `Sunucu ID: ${guild.id}` })
        .setTimestamp();

    message.reply({ embeds: [embed] });
};

exports.conf = {
    aliases: ["servericon", "guildicon","spp","swpp"],
};

exports.help = {
    name: "sunucupp",
};
