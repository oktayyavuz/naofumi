const { PermissionFlagsBits } = require("discord.js");
const db = require("croxydb");

exports.run = async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return message.reply('Bu komutu kullanmak için yönetici yetkisine sahip olmalısınız.');
    }

    const subCommand = args[0]?.toLowerCase();
    const targetChannel = message.mentions.channels.first() || message.channel; 
    if (!subCommand || !["başlat", "baslat", "start", "durdur", "stop"].includes(subCommand)) {
        return message.reply("Lütfen geçerli bir alt komut kullanın: `başlat` veya `durdur`");
    }

    try {
        if (["başlat", "baslat", "start"].includes(subCommand)) {
            const min = parseInt(args[1]) || 1; 
            const max = parseInt(args[2]) || 100; 

            const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
            
            if (!isNaN(randomNumber) && targetChannel.id) {
                await db.set(`guessNumberChannel_${message.guild.id}`, targetChannel.id);
                await db.set(`guessNumber_${message.guild.id}`, randomNumber);
                await db.set(`guessAttempts_${message.guild.id}`, 1);
            } else {
                return message.reply("Geçersiz kanal veya rastgele sayı oluşturulamadı. Lütfen tekrar deneyin.");
            }

            await message.channel.send(`🔢 **Sayı Tahmin Oyunu Başladı!**\n${targetChannel} kanalında ${min} ile ${max} arasında bir sayı tahmin edin. Doğru sayıyı tahmin eden ilk kişi kazanır!`);
        } else if (["durdur", "stop"].includes(subCommand)) {
            await db.delete(`guessNumberChannel_${message.guild.id}`);
            await db.delete(`guessNumber_${message.guild.id}`);
            await db.delete(`guessAttempts_${message.guild.id}`);

            await message.channel.send(`🛑 **Sayı Tahmin Oyunu Durduruldu**\n${targetChannel} kanalındaki sayı tahmin oyunu durduruldu.`);
        }
    } catch (error) {
        console.error("Hata oluştu:", error);
        message.reply("Bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
    }
};

exports.conf = {
  aliases: ["sayitahmini", "guessnumber","sayıtahmin"]
};

exports.help = {
  name: "sayitahmin"
};