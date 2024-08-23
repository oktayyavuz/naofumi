const { EmbedBuilder, Colors } = require("discord.js");
const db = require("croxydb");

function calculateXpNeeded(level) {
  return 50 * level;
}

exports.run = async (client, message, args) => {
  const economyEnabled = db.get("economyEnabled");

  if (!economyEnabled) {
    return message.reply("Ekonomi sistemi şu anda kapalı.");
  }

  let targetUser = message.mentions.users.first() || message.author; // Etiketlenen kullanıcı yoksa komutu kullanan kişi hedef alınır
  let userData = db.get(`economy_${targetUser.id}`);

  if (!userData) {
    userData = {
      money: 0,
      level: 1,
      xp: 0
    };
  }

  const xpNeeded = calculateXpNeeded(userData.level);

  const embed = new EmbedBuilder()
    .setColor(Colors.Blue)
    .setTitle(`${targetUser.username} - Seviye Durumu`)
    .setDescription(`${targetUser.id === message.author.id ? 'Mevcut bakiyeniz' : `${targetUser.username} kullanıcısının bakiyesi`} **${userData.money} okane**.`)
    .addFields(
      { name: 'Seviye', value: `${userData.level}` },
      { name: 'XP', value: `${userData.xp} / ${xpNeeded}` },
      { name: 'Gereken XP', value: `${xpNeeded - userData.xp}`}
    )
    .setFooter({ text: `Level: ${userData.level} | XP: ${userData.xp} / ${xpNeeded}` });

  message.reply({ embeds: [embed] });
};

exports.conf = {
  aliases: ["seviye", "xp", "level"]
};

exports.help = {
  name: "rank"
};
