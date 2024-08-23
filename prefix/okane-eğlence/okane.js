const { EmbedBuilder, Colors } = require("discord.js");
const db = require("croxydb");

exports.run = async (client, message, args) => {
  const economyEnabled = db.get("economyEnabled");

  if (!economyEnabled) {
    return message.reply("Ekonomi sistemi şu anda kapalı.");
  }

  let targetUser = message.mentions.users.first() || message.author;
  let userData = db.get(`economy_${targetUser.id}`);

  if (!userData) {
    userData = {
      money: 0,
      level: 1,
      xp: 0
    };
  }

  const embed = new EmbedBuilder()
    .setColor(Colors.Blue)
    .setTitle("Ekonomi Sistemi")
    .setDescription(`${targetUser.username}, ${targetUser.id === message.author.id ? 'mevcut bakiyeniz' : 'kullanıcısının bakiyesi'} **${userData.money} okane**.`)
    .addFields(
      { name: 'Seviye', value: `${userData.level}` },
      { name: 'XP', value: `${userData.xp}` }
    )
    .setFooter({ text: `Level: ${userData.level} | XP: ${userData.xp}` });

  message.reply({ embeds: [embed] });
};

exports.conf = {
  aliases: ["bal", "bakiye", "okane", "ok"]
};

exports.help = {
  name: "balance"
};
