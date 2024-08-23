const { EmbedBuilder, Colors } = require("discord.js");
const client = require("../../index.js");
const { prefix } = require("../../config.js");

client.on('messageCreate', message => {
    if (message.author.bot || message.content.startsWith(prefix)) return;
});

exports.run = async (client, message, args) => {
    const user = message.mentions.users.first() || message.author;
    const member = message.guild.members.cache.get(user.id);

    const embed = new EmbedBuilder()
        .setColor(Colors.Blue)
        .setTitle(`${user.tag} Kullanıcı Bilgisi`)
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .addFields(
            { name: "Kullanıcı Adı", value: `${user.tag}`, inline: true },
            { name: "ID", value: `${user.id}`, inline: true },
            { name: "Hesap Oluşturma Tarihi", value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: false },
            { name: "Sunucuya Katılma Tarihi", value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: false },
            { name: "Roller", value: `${member.roles.cache.map(role => role.toString()).join(", ")}`, inline: false }
        )
        .setFooter({ text: `Kullanıcı ID: ${user.id}` })
        .setTimestamp();

    message.reply({ embeds: [embed] });
};

exports.conf = {
    aliases: ["userinfo", "memberinfo","kb","kulllanicibilgi"],
};

exports.help = {
    name: "kullanıcıbilgi",
};
