const db = require("croxydb");
const config = require("../../config.js");

exports.run = async (client, message, args) => {
  if (message.author.id !== config.ownerID) {
    return message.reply("Bu komutu sadece bot sahibi kullanabilir.");
  }

  const action = args[0];

  if (!action) {
    return message.reply("Lütfen `aç` veya `kapat` argümanını girin.");
  }

  if (action === "aç") {
    db.set("economyEnabled", true);
    message.reply("Ekonomi sistemi açıldı.");
  } else if (action === "kapat") {
    db.delete("economyEnabled");
    message.reply("Ekonomi sistemi kapatıldı.");
  } else {
    message.reply("Geçersiz argüman. Lütfen `aç` veya `kapat` kullanın.");
  }
};

exports.conf = {
  aliases: ["okanesistemi"]
};

exports.help = {
  name: "okanesistemi"
};
