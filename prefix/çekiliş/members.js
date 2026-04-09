const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const db = require('croxydb');
const fs = require('fs');
const path = require('path');

exports.run = async (client, message, args) => {
    const giveawayId = args[0];
    if (!giveawayId) {
        return message.reply('Lütfen çekiliş ID\'sini belirtin.');
    }

    const giveawayData = await db.get(`giveaway_${giveawayId}`);
    if (!giveawayData) {
        return message.reply('Geçersiz çekiliş ID\'si.');
    }

    let participantList = 'Henüz katılımcı yok.';
    if (giveawayData.participants.length > 0) {
        const participants = await Promise.all(
            giveawayData.participants.map(async id => {
                const user = await client.users.fetch(id);
                return user.tag; 
            })
        );
        participantList = participants.join('\n');
    }

    const filePath = path.join(__dirname, `${giveawayId}_participants.txt`);
    fs.writeFileSync(filePath, `Ödül: ${giveawayData.prize}\nKatılımcılar:\n\n${participantList}`);

    const embed = new EmbedBuilder()
        .setTitle('Çekiliş Katılımcıları')
        .setDescription(`Ödül: ${giveawayData.prize}\nKatılımcılar:\n${participantList}`)
        .setColor('#0099ff')
        .setThumbnail('https://i.imgur.com/bCawYVT.png')
        .setTimestamp();

    const attachment = new AttachmentBuilder(filePath);
    await message.reply({ files: [attachment], embeds: [embed] });

    fs.unlinkSync(filePath);
};

exports.conf = {
    aliases: ["katılımcılar","gmember"]
};

exports.help = {
    name: "çekiliş-katılımcılar"
};
