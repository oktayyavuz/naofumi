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
            const interval = parseInt(args[1]) || 7; 

            await db.set(`bomChannel_${message.guild.id}`, targetChannel.id);
            await db.set(`bomNumber_${message.guild.id}`, 1);
            await db.set(`bomInterval_${message.guild.id}`, interval);
            await db.delete(`lastBomPlayer_${message.guild.id}`);

            const startEmbed = new EmbedBuilder()
                .setColor(Colors.Blue)
                .setTitle('💣 Bom Oyunu Başladı!')
                .setDescription(`${targetChannel} kanalında 1'den başlayarak sırayla sayı sayın. Her ${interval}. sayıda "bom" yazın. Her kullanıcı sırayla bir sayı veya "bom" yazabilir.`)
                .setFooter({ text: 'İyi eğlenceler!' });

            await message.channel.send({ embeds: [startEmbed] });
        } else if (["durdur", "stop"].includes(subCommand)) {
            await db.delete(`bomChannel_${message.guild.id}`);
            await db.delete(`bomNumber_${message.guild.id}`);
            await db.delete(`bomInterval_${message.guild.id}`);
            await db.delete(`lastBomPlayer_${message.guild.id}`);

            const stopEmbed = new EmbedBuilder()
                .setColor(Colors.Red)
                .setTitle('🛑 Bom Oyunu Durduruldu')
                .setDescription(`${targetChannel} kanalındaki bom oyunu durduruldu.`)
                .setFooter({ text: 'Yeni bir oyun başlatmak için n.bombasla başlat <kanal> <aralık> komutunu kullanın.' });

            await message.channel.send({ embeds: [stopEmbed] });
        }
    } catch (error) {
        console.error("Hata oluştu:", error);
        message.reply("Bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
    }
};

exports.conf = {
  aliases: ["bomoyunu", "bombagame"]
};

exports.help = {
  name: "bom"
};