const db = require('croxydb');
const client = require("../../index.js");

exports.run = async (client, message, args) => {
    if (message.author.id !== message.guild.ownerId) {
        return message.reply('Bu komutu sadece sunucu sahibi kullanabilir.');
    }

    if (args[0] === 'kapat') {
        const privateRoomCategoryId = await db.get(`privateRoomCategory_${message.guild.id}`);
        const privateRoomChannelId = await db.get(`privateRoomChannel_${message.guild.id}`);

        // Check if the private room system exists
        if (!privateRoomCategoryId && !privateRoomChannelId) {
            return message.reply('Özel oda sistemi zaten kapatılmış.');
        }

        if (privateRoomCategoryId) {
            const category = message.guild.channels.cache.get(privateRoomCategoryId);
            if (category) {
                // Kanallar üzerinde döngü yapma
                category.children.cache.forEach(async (channel) => {
                    await db.delete(`privateRoom_${channel.id}`);
                    await channel.delete().catch(console.error);
                });
                await category.delete().catch(console.error);
            }
            await db.delete(`privateRoomCategory_${message.guild.id}`);
        }

        if (privateRoomChannelId) {
            const channel = message.guild.channels.cache.get(privateRoomChannelId);
            if (channel) {
                try {
                    await channel.delete();
                } catch (error) {
                    if (error.code === 10003) {
                        console.log('Kanal zaten silinmiş.');
                    } else {
                        console.error('Kanal silinirken bir hata oluştu:', error);
                    }
                }
            }
            await db.delete(`privateRoomChannel_${message.guild.id}`);
        }

        message.reply('Özel oda sistemi kapatıldı ve tüm odalar silindi.');
    } else {
        message.reply('Yanlış kullanım! Özel oda sistemini kapatmak için `özeloda kapat` komutunu kullanın.');
    }
};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: [],
    permLevel: 0
};

exports.help = {
    name: 'özeloda'
};
