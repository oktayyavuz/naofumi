const { EmbedBuilder, time } = require('discord.js');
const db = require('croxydb');

exports.run = async (client, message, args) => {
    const giveawayId = args[0];
    if (!giveawayId) {
        return message.reply('Lütfen çekiliş ID\'sini belirtin.');
    }

    const giveawayData = await db.get(`giveaway_${giveawayId}`);
    if (!giveawayData) {
        return message.reply('Geçersiz çekiliş ID\'si.');
    }

    let durationText;

    const endTime = giveawayData.startTime + giveawayData.duration;
    if (Date.now() >= endTime) {
        durationText = 'Çekiliş Bitti';
    } else {
        durationText = time(Math.floor(endTime / 1000), 'R');
    }

    const embed = new EmbedBuilder()
        .setTitle('Çekiliş Bilgisi')
        .setDescription(`Ödül: ${giveawayData.prize}\nSüre: ${durationText}\nKatılımcılar: ${giveawayData.participants.length}`)
        .setColor('#0099ff')
        .setThumbnail('https://i.imgur.com/bCawYVT.png')
        .setTimestamp();

    message.reply({ embeds: [embed] });
};

exports.conf = {
    aliases: ["çekilisinfo", "ginfo"]
};

exports.help = {
    name: "çekiliş-bilgi"
};
