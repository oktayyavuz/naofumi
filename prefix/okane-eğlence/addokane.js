const db = require("croxydb"); 
const config = require("../../config.js");

exports.run = async (client, message, args) => {
  if (message.author.id !== config.ownerID) {
    return message.reply("Bu komutu sadece bot sahibi kullanabilir.");
  }

  let user = message.mentions.users.first() || client.users.cache.get(args[0]);
  if (!user) {
    return message.reply("Bir kullanıcı belirtmelisiniz. Doğru kullanım: `n.okaneadd @kullanıcı miktar`");
  }

  let amount = parseInt(args[1]);
  if (isNaN(amount) || amount <= 0) {
    return message.reply("Geçerli bir miktar belirtmelisiniz. Doğru kullanım: `n.okaneadd @kullanıcı miktar`");
  }

  let userData = db.get(`economy_${user.id}`);
  if (!userData) {
    userData = { money: 0, level: 1 };
  }

  userData.money += amount;
  db.set(`economy_${user.id}`, userData);

  message.reply(`${user.tag} adlı kullanıcıya ${amount} okane eklendi.`);
};

exports.conf = {
  aliases: ["giveokane","okaneekle"]
};

exports.help = {
  name: "okaneadd"
};
