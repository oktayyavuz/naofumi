const { EmbedBuilder, Colors } = require("discord.js");
const db = require("croxydb");
const config = require("../../config.js");

exports.run = async (client, message, args) => {
  const economyEnabled = db.get("economyEnabled");

  if (!economyEnabled) {
    return message.reply("Ekonomi sistemi şu anda kapalı.");
  }

  let userData = db.get(`economy_${message.author.id}`);

  if (!userData) {
    userData = {
      money: 0,
      level: 1,
      lastDailyClaim: null
    };
  }

  const today = new Date().toDateString();

  if (userData.lastDailyClaim === today) {
    return message.reply("Günlük ödülünüzü zaten aldınız. Lütfen bir sonraki ödülü bekleyin.");
  }

  const reward = 2000; 
  userData.money += reward;
  userData.lastDailyClaim = today; 

  db.set(`economy_${message.author.id}`, userData);

  const embed = new EmbedBuilder()
    .setColor(Colors.Green)
    .setDescription(`Günlük ödül olarak **${reward} okane** kazandınız!`);
  
  message.reply({ embeds: [embed] });
};

exports.conf = {
  aliases: ["daily"]
};

exports.help = {
  name: "daily"
};
