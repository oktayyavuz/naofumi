const { EmbedBuilder, Colors } = require("discord.js");
const db = require("croxydb");
const config = require("../../config.js");

function calculateLevelReward(level) {
  return 10000 + (level - 1) * 1000;
}

exports.run = async (client, message, args) => {
  if (message.author.id !== config.ownerID) {
    return message.reply("Bu komutu sadece bot sahibi kullanabilir.");
  }

  let user = message.mentions.users.first() || client.users.cache.get(args[0]);
  if (!user) return message.reply("Bir kullanıcı belirtmelisiniz. Örnek: `n.addlevel @kullanıcı 5`");

  let level = parseInt(args[1]);
  if (isNaN(level) || level <= 0) return message.reply("Geçerli bir seviye belirtmelisiniz. Örnek: `n.addlevel @kullanıcı 5`");

  let userData = db.get(`economy_${user.id}`);
  if (!userData) {
    userData = { money: 0, level: 1, xp: 0 };
  }

  let totalReward = 0;

  for (let i = 0; i < level; i++) {
    userData.level++;
    totalReward += calculateLevelReward(userData.level);
  }

  userData.money += totalReward;
  db.set(`economy_${user.id}`, userData);

  const embed = new EmbedBuilder()
    .setColor(Colors.Green)
    .setTitle("Seviye Eklendi!")
    .setDescription(`${user.tag} adlı kullanıcıya ${level} seviye eklendi.`)
    .addFields(
      { name: 'Eklenen Seviye', value: `${level}`, inline: true },
      { name: 'Toplam Kazanılan Para', value: `**${totalReward} okane**`, inline: true },
      { name: 'Yeni Seviye', value: `${userData.level}`, inline: true },
      { name: 'Yeni Bakiye', value: `**${userData.money} okane**`, inline: true }
    )
    .setTimestamp();

  message.reply({ embeds: [embed] });
};

exports.conf = {
  aliases: ["leveladd"]
};

exports.help = {
  name: "addlevel"
};
