const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('croxydb');
const { v4: uuidv4 } = require('uuid');
const ms = require('ms');
const client = require("../../index.js");

function parseDurationAndPrize(args) {
    let durationStr = '';
    let prize = '';
    let foundDuration = false;

    for (let arg of args) {
        if (!foundDuration && /^\d+[smhd]$/i.test(arg)) {
            durationStr += arg + ' ';
            foundDuration = true;
        } else {
            prize += arg + ' ';
        }
    }

    return {
        durationStr: durationStr.trim(),
        prize: prize.trim()
    };
}

exports.run = async (client, message, args) => {
    if (!message.member.permissions.has('MANAGE_GUILD')) {
        return message.reply('Bu komutu kullanmak için "Sunucuyu Yönet" yetkisine ihtiyacınız var.');
    }

    const { durationStr, prize } = parseDurationAndPrize(args);

    if (!prize) {
        return message.reply('Lütfen çekiliş ödülünü belirtin.');
    }

    let duration;
    try {
        duration = ms(durationStr);
        if (!duration || duration < 1000) throw new Error('Geçersiz süre');
    } catch (error) {
        return message.reply('Lütfen geçerli bir süre belirtin (örneğin: 1h, 30m, 1d). Geçerli birimler: s (saniye), m (dakika), h (saat), d (gün).');
    }

    const giveawayId = uuidv4();
    const embed = new EmbedBuilder()
        .setTitle('🎉 Çekiliş Başladı! 🎉')
        .setDescription(`Ödül: ${prize}\nKatılmak veya ayrılmak için butona tıklayın!\n\nBitiş zamanı: <t:${Math.floor((Date.now() + duration) / 1000)}:R>`)
        .setFooter({ text: `Çekiliş ID: ${giveawayId}` })
        .setColor('#0099ff')
        .setThumbnail('https://i.imgur.com/bCawYVT.png')
        .setTimestamp(Date.now() + duration);

    const toggleButton = new ButtonBuilder()
        .setCustomId(`giveaway_toggle_${giveawayId}`)
        .setLabel('Katıl/Ayrıl')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🎁');

    const actionRow = new ActionRowBuilder()
        .addComponents(toggleButton);

    try {
        const giveawayMessage = await message.channel.send({
            embeds: [embed],
            components: [actionRow]
        });

        await db.set(`giveaway_${giveawayId}`, {
            prize: prize,
            duration: duration,
            startTime: Date.now(),
            messageId: giveawayMessage.id,
            channelId: message.channel.id,
            participants: [],
            ended: false
        });
        countdownGiveaway(client, giveawayId);

    } catch (error) {
        console.error('Çekiliş başlatılırken bir hata oluştu:', error);
        message.reply('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    }
};

function countdownGiveaway(client, giveawayId) {
    const interval = setInterval(async () => {
        const giveawayData = await db.get(`giveaway_${giveawayId}`);
        if (!giveawayData || giveawayData.ended) {
            console.log(`Çekiliş ${giveawayId} sonlandı veya bulunamadı.`);
            clearInterval(interval);
            return;
        }

        const elapsed = Date.now() - giveawayData.startTime;
        const remainingTime = giveawayData.duration - elapsed;

        if (remainingTime <= 0) {
            console.log(`Çekiliş ${giveawayId} süresi doldu, sonlandırılıyor...`);
            clearInterval(interval);
            await endGiveaway(client, giveawayId);
        } else {
            updateGiveawayMessage(client, giveawayId, remainingTime);
        }
    }, 5000); 
}

async function updateGiveawayMessage(client, giveawayId, remainingTime) {
    const giveawayData = await db.get(`giveaway_${giveawayId}`);
    if (!giveawayData) return;

    const channel = await client.channels.fetch(giveawayData.channelId);
    if (!channel) return;

    let messageUpdated = false;
    let retryCount = 0;
    const maxRetries = 5;

    while (!messageUpdated && retryCount < maxRetries) {
        try {
            const message = await channel.messages.fetch(giveawayData.messageId);
            
            const updatedEmbed = new EmbedBuilder()
                .setTitle('🎉 Çekiliş Devam Ediyor! 🎉')
                .setDescription(`Ödül: ${giveawayData.prize}\nKatılmak veya ayrılmak için butona tıklayın!\n\nBitiş zamanı: <t:${Math.floor((Date.now() + remainingTime) / 1000)}:R>`)
                .setFooter({ text: `Çekiliş ID: ${giveawayId}` })
                .setColor('#0099ff')
                .setThumbnail('https://i.imgur.com/bCawYVT.png')
                .setTimestamp(Date.now() + remainingTime);

            await message.edit({ embeds: [updatedEmbed] });
            messageUpdated = true;
        } catch (error) {
            console.error(`Çekiliş mesajı güncellenirken hata oluştu (ID: ${giveawayId}), tekrar deneniyor...`, error);
            retryCount++;
            if (retryCount >= maxRetries) {
                console.error(`Çekiliş mesajı güncellenirken ${maxRetries} kez hata alındı, denemeler durduruluyor.`);
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 5000)); 
        }
    }
}


async function endGiveaway(client, giveawayId) {
    const giveawayData = await db.get(`giveaway_${giveawayId}`);
    if (!giveawayData || giveawayData.ended) return;

    const channel = await client.channels.fetch(giveawayData.channelId);
    if (!channel) return;

    let endEmbed;
    if (giveawayData.participants.length === 0) {
        endEmbed = new EmbedBuilder()
            .setTitle('Çekiliş Bitti!')
            .setDescription(`Ödül: ${giveawayData.prize}\nBu çekilişte hiç katılımcı yok.`)
            .setColor('#FF0000')
            .setThumbnail('https://i.imgur.com/bCawYVT.png')
            .setTimestamp();

        await channel.send({ embeds: [endEmbed] });
    } else {
        const winnerId = giveawayData.participants[Math.floor(Math.random() * giveawayData.participants.length)];
        let winnerUser;
        try {
            winnerUser = await client.users.fetch(winnerId);
        } catch (error) {
            console.error('Kazanan kullanıcı bulunamadı:', error);
        }

        if (!winnerUser) {
            endEmbed = new EmbedBuilder()
                .setTitle('Çekiliş Bitti!')
                .setDescription(`Ödül: ${giveawayData.prize}\nBu çekilişte kazanan çıkmadı.`)
                .setColor('#FF0000')
                .setThumbnail('https://i.imgur.com/bCawYVT.png')
                .setTimestamp();

            await channel.send({ embeds: [endEmbed] });
        } else {
            endEmbed = new EmbedBuilder()
                .setTitle('Çekiliş Bitti!')
                .setDescription(`Ödül: ${giveawayData.prize}\nKazanan: ${winnerUser.tag}`)
                .setColor('#FF0000')
                .setThumbnail('https://i.imgur.com/bCawYVT.png')
                .setTimestamp();

            await channel.send(`🎉 Tebrikler <@${winnerUser.id}>! Sen kazandın! 🎉`);
            await channel.send({ embeds: [endEmbed] });
        }
    }

    giveawayData.ended = true;
    await db.set(`giveaway_${giveawayId}`, giveawayData);
}

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (!interaction.customId.startsWith('giveaway_toggle_')) return;

    const giveawayId = interaction.customId.split('_')[2];
    const giveawayData = await db.get(`giveaway_${giveawayId}`);

    if (!giveawayData) {
        return interaction.reply({ content: 'Geçersiz çekiliş ID!', ephemeral: true });
    }

    if (giveawayData.ended) {
        return interaction.reply({ content: 'Bu çekiliş süresi dolmuş!', ephemeral: true });
    }

    const participantIndex = giveawayData.participants.indexOf(interaction.user.id);

    if (participantIndex === -1) {
        giveawayData.participants.push(interaction.user.id);
        await interaction.reply({ content: 'Çekilişe katıldınız!', ephemeral: true });
    } else {
        giveawayData.participants.splice(participantIndex, 1);
        await interaction.reply({ content: 'Çekilişten ayrıldınız!', ephemeral: true });
    }

    await db.set(`giveaway_${giveawayId}`, giveawayData);
});


exports.conf = {
    aliases: ["çekiliş", "giveaway", "gcr", "gcreate"]
};

exports.help = {
    name: "çekiliş"
};

