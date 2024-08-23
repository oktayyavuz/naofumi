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
            await db.set(`wordChainChannel_${message.guild.id}`, targetChannel.id);
            await db.set(`wordChainLastWord_${message.guild.id}`, 'naofumi');
            await db.delete(`wordChainLastPlayer_${message.guild.id}`);

            const startEmbed = new EmbedBuilder()
                .setColor(Colors.Blue)
                .setTitle('🔗 Kelime Zinciri Oyunu Başladı!')
                .setDescription(`İlk kelime "**naofumi**"! \n\n ${targetChannel} kanalında ilk kelimeyi söyleyin ve her yeni kelime bir önceki kelimenin son harfiyle başlamalıdır. Yanlış kelime söyleyen oyuncu oyunu kaybeder!`)
                .setFooter({ text: 'İyi eğlenceler!' });

            await message.channel.send({ embeds: [startEmbed] });
        } else if (["durdur", "stop"].includes(subCommand)) {
            await db.delete(`wordChainChannel_${message.guild.id}`);
            await db.delete(`wordChainLastWord_${message.guild.id}`);
            await db.delete(`wordChainLastPlayer_${message.guild.id}`);

            const stopEmbed = new EmbedBuilder()
                .setColor(Colors.Red)
                .setTitle('🛑 Kelime Zinciri Oyunu Durduruldu')
                .setDescription(`${targetChannel} kanalındaki kelime zinciri oyunu durduruldu.`)
                .setFooter({ text: 'Yeni bir oyun başlatmak için komutu yeniden kullanın.' });

            await message.channel.send({ embeds: [stopEmbed] });
        }
    } catch (error) {
        console.error("Hata oluştu:", error);
        message.reply("Bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
    }
};

exports.conf = {
  aliases: ["kelimezinciri", "wordchain"]
};

exports.help = {
  name: "kelime"
};