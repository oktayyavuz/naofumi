const { PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, UserSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const db = require('croxydb');
const client = require("../../index.js");

module.exports = {
    name: "özelodasistemi",
    description: "Özel oda sistemini aç veya kapat.",
    options: [
        {
            name: "işlem",
            description: "Sistemi aç veya kapat",
            type: 3, 
            required: true,
            choices: [
                { name: "Aç", value: "aç" },
                { name: "Kapat", value: "kapat" }
            ]
        }
    ],

    run: async (client, interaction) => {
        const işlem = interaction.options.getString("işlem");

        if (interaction.user.id !== interaction.guild.ownerId) {
            return interaction.reply('Bu komutu sadece sunucu sahibi kullanabilir.');
        }

        const privateRoomCategoryId = await db.get(`privateRoomCategory_${interaction.guild.id}`);
        const privateRoomChannelId = await db.get(`privateRoomChannel_${interaction.guild.id}`);

        if (işlem === 'aç') {
            if (privateRoomCategoryId || privateRoomChannelId) {
                return interaction.reply('Özel oda sistemi zaten açık.');
            }

            const category = await interaction.guild.channels.create({
                name: 'Özel Oda',
                type: ChannelType.GuildCategory
            });

            const channel = await interaction.guild.channels.create({
                name: '🎧 Özel Oda Oluştur',
                type: ChannelType.GuildVoice,
                parent: category.id
            });

            await db.set(`privateRoomCategory_${interaction.guild.id}`, category.id);
            await db.set(`privateRoomChannel_${interaction.guild.id}`, channel.id);

            interaction.reply('Özel oda sistemi başarıyla kuruldu!');
        } else if (işlem === 'kapat') {
            if (!privateRoomCategoryId && !privateRoomChannelId) {
                return interaction.reply('Özel oda sistemi zaten kapalı.');
            }

            if (privateRoomCategoryId) {
                const category = interaction.guild.channels.cache.get(privateRoomCategoryId);
                if (category) {
                    category.children.cache.forEach(async (channel) => {
                        await db.delete(`privateRoom_${channel.id}`);
                        await channel.delete().catch(console.error);
                    });
                    await category.delete().catch(console.error);
                }
                await db.delete(`privateRoomCategory_${interaction.guild.id}`);
            }

            if (privateRoomChannelId) {
                const channel = interaction.guild.channels.cache.get(privateRoomChannelId);
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
                await db.delete(`privateRoomChannel_${interaction.guild.id}`);
            }

            interaction.reply('Özel oda sistemi kapatıldı ve tüm odalar silindi.');
        } else {
            interaction.reply('Geçersiz işlem! "aç" veya "kapat" seçeneklerinden birini kullanın.');
        }
    },
};
