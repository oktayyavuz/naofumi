const { EmbedBuilder, Colors, PermissionFlagsBits } = require("discord.js");
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
      await db.set(`countingChannel_${message.guild.id}`, targetChannel.id);
      await db.set(`currentCount_${message.guild.id}`, 1);
      await db.delete(`lastCounter_${message.guild.id}`);

      const startEmbed = new EmbedBuilder()
        .setColor(Colors.Blue)
        .setTitle('🎮 Sayı Sayma Oyunu Başladı!')
        .setDescription(`${targetChannel} kanalında 1'den başlayarak sırayla sayı saymaya başlayın. Her kullanıcı sırayla bir sayı yazabilir.`)
        .setFooter({ text: 'İyi eğlenceler!' });

      await message.channel.send({ embeds: [startEmbed] });

      const firstNumberEmbed = new EmbedBuilder()
        .setColor(Colors.Green)
        .setDescription('Oyun başladı! İlk sayı benden: **1**')
        .setFooter({ text: 'Sıradaki sayı: 2' });

      await targetChannel.send({ embeds: [firstNumberEmbed] });

      await db.set(`currentCount_${message.guild.id}`, 1);
      await db.set(`lastCounter_${message.guild.id}`, client.user.id);

    } else if (["durdur", "stop"].includes(subCommand)) {
      await db.delete(`countingChannel_${message.guild.id}`);
      await db.delete(`currentCount_${message.guild.id}`);
      await db.delete(`lastCounter_${message.guild.id}`);

      const stopEmbed = new EmbedBuilder()
        .setColor(Colors.Red)
        .setTitle('🛑 Sayı Sayma Oyunu Durduruldu')
        .setDescription(`${targetChannel} kanalındaki sayı sayma oyunu durduruldu.`)
        .setFooter({ text: 'Yeni bir oyun başlatmak için !saymayabasla başlat komutunu kullanın.' });

      await message.channel.send({ embeds: [stopEmbed] });
    }

  } catch (error) {
    console.error("Hata oluştu:", error);
    message.reply("Bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
  }
};

exports.conf = {
  aliases: ["sayisayma", "sayioyunu","sayıoyunu","sayısayma"]
};

exports.help = {
  name: "saymayabasla"
};