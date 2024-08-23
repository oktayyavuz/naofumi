const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const db = require('croxydb');
const client = require("../../index.js");

exports.run = async (client, message, args) => {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
        return message.reply('Bu komutu kullanmak için "Sunucuyu Yönet" yetkisine ihtiyacınız var.');
    }

    const subcommand = args[0];

    if (subcommand === 'ayarla') {
        if (args.length < 2) {
            return message.reply('Lütfen doğru kullanımı takip edin: `!hg-bb ayarla <#kanal> [hoşgeldin mesajı] [güle güle mesajı]`');
        }

        const channel = message.mentions.channels.first();
        if (!channel) {
            return message.reply('Lütfen geçerli bir kanal etiketleyin.');
        }

        const welcomeMessage = args.length > 2 ? args.slice(2, -1).join(' ') : null;
        const goodbyeMessage = args.length > 3 ? args.slice(-1)[0] : null;

        try {
            await db.set(`welcomeChannel_${message.guild.id}`, channel.id);
            if (welcomeMessage) {
                await db.set(`welcomeMessage_${message.guild.id}`, welcomeMessage);
            } else {
                await db.delete(`welcomeMessage_${message.guild.id}`);
            }

            await db.set(`goodbyeChannel_${message.guild.id}`, channel.id);
            if (goodbyeMessage) {
                await db.set(`goodbyeMessage_${message.guild.id}`, goodbyeMessage);
            } else {
                await db.delete(`goodbyeMessage_${message.guild.id}`);
            }

            return message.reply('Hoş geldin ve güle güle mesajları başarıyla ayarlandı!');
        } catch (error) {
            console.error('Hoş geldin/güle güle mesajları ayarlanırken bir hata oluştu:', error);
            return message.reply('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        }
    } else if (subcommand === 'kapat') {
        try {
            await db.delete(`welcomeChannel_${message.guild.id}`);
            await db.delete(`welcomeMessage_${message.guild.id}`);
            await db.delete(`goodbyeChannel_${message.guild.id}`);
            await db.delete(`goodbyeMessage_${message.guild.id}`);

            return message.reply('Hoş geldin ve güle güle mesajları başarıyla kapatıldı!');
        } catch (error) {
            console.error('Hoş geldin/güle güle mesajları kapatılırken bir hata oluştu:', error);
            return message.reply('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        }
    } else {
        return message.reply('Geçersiz bir alt komut. Lütfen `ayarla` veya `kapat` kullanın.');
    }
};

client.on('guildMemberAdd', async (member) => {
    const welcomeChannelId = await db.get(`welcomeChannel_${member.guild.id}`);
    const welcomeMessage = await db.get(`welcomeMessage_${member.guild.id}`);

    if (welcomeChannelId) {
        const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);
        if (welcomeChannel) {
            let embedDescription = '';
            const totalMembers = member.guild.memberCount;

            if (welcomeMessage) {
                embedDescription = welcomeMessage.replace('{user}', member.toString());
            } else {
                embedDescription = `Sunucumuza hoş geldin, ${member}! Seninl birlikte **${totalMembers}** olduk. `;
            }

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setDescription(embedDescription)
                .setImage('https://i.hizliresim.com/nf0b3d7.gif')
                .setTimestamp();

            welcomeChannel.send({ content: member.toString(), embeds: [embed] });
        }
    }
});

client.on('guildMemberRemove', async (member) => {
    const goodbyeChannelId = await db.get(`goodbyeChannel_${member.guild.id}`);
    const goodbyeMessage = await db.get(`goodbyeMessage_${member.guild.id}`);

    if (goodbyeChannelId) {
        const goodbyeChannel = member.guild.channels.cache.get(goodbyeChannelId);
        if (goodbyeChannel) {
            let embedDescription = '';
            const totalMembers = member.guild.memberCount;

            if (goodbyeMessage) {
                embedDescription = goodbyeMessage.replace('{user}', member.user.tag);
            } else {
                embedDescription = `${member.user.tag}, aramızdan ayrıldı. Sensiz bir kişi eksiğiz.. Cidden.. **${totalMembers}** kişiye düştük :( `;
            }

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setDescription(embedDescription)
                .setImage('https://i.hizliresim.com/olueffp.gif')
                .setTimestamp();

            goodbyeChannel.send({ embeds: [embed] });
        }
    }
});

exports.conf = {
    aliases: ['hg-bb']
};

exports.help = {
    name: 'hosgeldin-bb'
};
