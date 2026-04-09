const { EmbedBuilder } = require('discord.js');
const db = require('croxydb');

exports.run = async (client, message, args) => {
    if (!message.member.permissions.has('MANAGE_GUILD')) {
        return message.reply('Bu komutu kullanmak için "Sunucuyu Yönet" yetkisine ihtiyacınız var.');
    }

    const giveawayId = args[0];
    if (!giveawayId) {
        return message.reply('Lütfen çekiliş ID\'sini belirtin.');
    }

    const giveawayData = await db.get(`giveaway_${giveawayId}`);
    if (!giveawayData) {
        return message.reply('Geçersiz çekiliş ID\'si.');
    }

    if (Date.now() <= giveawayData.endTime) {
        return message.reply('Bu çekiliş henüz bitmedi.');
    }

    if (giveawayData.participants.length === 0) {
        return message.reply('Bu çekilişte hiç katılımcı yok.');
    }

    const winnerId = giveawayData.participants[Math.floor(Math.random() * giveawayData.participants.length)];
    const winner = await client.users.fetch(winnerId);

    const channel = await client.channels.fetch(giveawayData.channelId);

    const embed = new EmbedBuilder()
        .setTitle('Çekiliş Kazananı!')
        .setDescription(`Yeni Kazanan: <@${winnerId}> \n Ödül: ${giveawayData.prize}`)
        .setColor('#0099ff')
        .setThumbnail('https://i.imgur.com/bCawYVT.png')
        .setTimestamp();
        
    try {
        await message.channel.send({ embeds: [embed] });
        message.reply(`Yeni kazanan başarıyla belirlendi: <@${winnerId}>`);
    } catch (error) {
        console.error('Kazanan belirlenirken bir hata oluştu:', error);
        message.reply('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    }
};

exports.conf = {
    aliases: ["reroll", "greroll"]
};

exports.help = {
    name: "çekiliş-yeniden-çek"
};
