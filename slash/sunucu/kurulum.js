const { PermissionsBitField, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../../config.js'); 

module.exports = {
    name: 'kurulum',
    description: 'Sunucuda çeşitli kurulum işlemlerini gerçekleştirir.',
    options: [], 
    run: async (client, interaction) => {
        if (interaction.user.id !== config.ownerID) {
            return interaction.reply({ content: 'Bu komutu sadece bot sahibi kullanabilir.', ephemeral: true });
        }

        const selectMenu = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('setup')
                    .setPlaceholder('Bir kurulum seçin')
                    .addOptions([
                        {
                            label: 'Rol Kurulum',
                            description: 'Sunucudaki rolleri yeniden düzenler',
                            value: 'role_setup',
                        },
                        {
                            label: 'Kanal Kurulum',
                            description: 'Sunucudaki kanalları yeniden düzenler',
                            value: 'channel_setup',
                        },
                        {
                            label: 'Emoji Kurulum',
                            description: 'Sunucuya emojileri yükler',
                            value: 'emoji_setup',
                        },
                    ]),
            );

        await interaction.reply({
            content: 'Lütfen yapmak istediğiniz kurulum işlemini seçin:',
            components: [selectMenu],
            ephemeral: true, 
        });

        const filter = i => i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async i => {
            if (i.customId === 'setup') {
                const choice = i.values[0];
                await i.deferUpdate();
        
                const confirmEmbed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle('Kurulum Onayı')
                    .setDescription(`${choice.replace('_', ' ')} işlemini başlatmak istediğinizden emin misiniz? Onaylamak için 5 saniye içinde "eminim" yazın.`);
        
                await i.editReply({ embeds: [confirmEmbed], components: [], ephemeral: true });
        
                const messageCollector = i.channel.createMessageCollector({
                    filter: m => m.author.id === interaction.user.id,
                    time: 5000,
                    max: 1
                });
        
                messageCollector.on('collect', async m => {
                    if (m.content.toLowerCase() === 'eminim') {
                        switch (choice) {
                            case 'role_setup':
                                await roleSetup(interaction);
                                break;
                            case 'channel_setup':
                                await channelSetup(interaction);
                                break;
                            case 'emoji_setup':
                                await emojiSetup(interaction);
                                break;
                        }
                    } else {
                        await i.followUp({ content: 'Kurulum işlemi iptal edildi.', ephemeral: true });
                    }
                });
        
                messageCollector.on('end', collected => {
                    if (collected.size === 0) {
                        i.followUp({ content: 'Zaman aşımı: Kurulum işlemi iptal edildi.', ephemeral: true });
                    }
                });
            }
        });
        
    }
};

async function roleSetup(interaction) {
    interaction.followUp({ content: 'Rol kurulum işlemi başlatılıyor...', ephemeral: true });

    const rolesToCreate = [
        { name: '👑 Sunucu Sahibi', color: "#0d0101", permissions: [PermissionsBitField.Flags.Administrator], hoist: true },
        { name: '🛡️ Admin', color: "#d41313", permissions: [PermissionsBitField.Flags.ManageGuild, PermissionsBitField.Flags.BanMembers, PermissionsBitField.Flags.SendMessages], hoist: true },
        { name: '🔨 Moderatör', color: "#1367d4", permissions: [PermissionsBitField.Flags.ManageMessages, PermissionsBitField.Flags.KickMembers, PermissionsBitField.Flags.SendMessages], hoist: true },
        { name: '📚 Destek Ekibi', color: "#d4c713", permissions: [PermissionsBitField.Flags.ManageRoles, PermissionsBitField.Flags.SendMessages], hoist: true },
        { name: '📝 Kayıt Yetkilisi', color: "#c28274", permissions: [PermissionsBitField.Flags.ManageRoles, PermissionsBitField.Flags.SendMessages], hoist: true },
        { name: '🔰 Test Admin', color: "#c28274", permissions: [PermissionsBitField.Flags.ManageRoles, PermissionsBitField.Flags.SendMessages], hoist: true },
        { name: '🛡️ Deneme Moderatör', color: "#c28274", permissions: [PermissionsBitField.Flags.ManageRoles, PermissionsBitField.Flags.SendMessages], hoist: true },
        { name: '🧰 Test Support', color: "#c28274", permissions: [PermissionsBitField.Flags.ManageRoles, PermissionsBitField.Flags.SendMessages], hoist: true },
        { name: '🟡 Sarı', color: "#ffff00", permissions: [], hoist: false },
        { name: '🔵 Mavi', color: "#0000ff", permissions: [], hoist: false },
        { name: '🟢 Yeşil', color: "#00ff00", permissions: [], hoist: false },
        { name: '🔴 Kırmızı', color: "#ff0000", permissions: [], hoist: false },
        { name: '🟠 Turuncu', color: "#ffa500", permissions: [], hoist: false },
        { name: '🟣 Mor', color: "#800080", permissions: [], hoist: false },
        { name: '⚪ Beyaz', color: "#ffffff", permissions: [], hoist: false },
        { name: '⚫ Siyah', color: "#000000", permissions: [], hoist: false },
        { name: '🔵 Lacivert', color: "#000080", permissions: [], hoist: false },
        { name: '🟤 Kahverengi', color: "#8b4513", permissions: [], hoist: false },
        { name: '👥 Üye', color: "#ffffff", permissions: [PermissionsBitField.Flags.SendMessages], hoist: false },
        { name: '💻 Yazılımcı', color: "#ffffff", permissions: [PermissionsBitField.Flags.SendMessages], hoist: false },
        { name: '👤 Erkek', color: "#00008b", permissions: [PermissionsBitField.Flags.SendMessages], hoist: false },
        { name: '🤦 Kız', color: "#ffc0cb", permissions: [PermissionsBitField.Flags.SendMessages], hoist: false },
        { name: '☢️ Mute', color: "#878383", permissions: [PermissionsBitField.Flags.ViewChannel], hoist: false }
    ];

    const existingRoles = interaction.guild.roles.cache.filter(role => role.name !== '@everyone' && !role.managed);
    for (const [id, role] of existingRoles) {
        try {
            await role.delete().catch(() => {});
        } catch (error) {
        }
    }

    for (const roleData of rolesToCreate) {
        try {
            const createdRole = await interaction.guild.roles.create({
                name: roleData.name,
                color: roleData.color,
                permissions: roleData.permissions,
                hoist: roleData.hoist
            });
            
            if (roleData.name === '☢️ Mute') {
                const channels = interaction.guild.channels.cache.filter(c => c.type !== ChannelType.GuildCategory);
                for (const [id, channel] of channels) {
                    await channel.permissionOverwrites.edit(createdRole, {
                        SendMessages: false,
                        AddReactions: false
                    }).catch(() => {});
                }
            }
        } catch (error) {
        }
    }

    interaction.followUp({ content: 'Rol kurulum işlemi tamamlandı.', ephemeral: true });
}

async function channelSetup(interaction) {
    if (interaction.guild.features.includes('COMMUNITY')) {
        return interaction.followUp({ content: 'Bu sunucu bir topluluk sunucusu olduğu için kanal kurulumu yapılamaz.', ephemeral: true });
    }

    await interaction.followUp({ content: 'Kanal kurulum işlemi başlatılıyor...', ephemeral: true });

    const categoriesToCreate = [
        { name: '📢 | Bilgilendirme', channels: ['『📜』kurallar', '『📣』duyurular', '『👋』hoşgeldin', '『📊』Oylama', '『🎊』etkinlikler'] },
        { name: '💬 | Genel', channels: ['『💬』genel-sohbet', '『🤖』bot-komutları', '『📸』fotoğraf-sergisi', '『💁』genel-destek', '『💡』Öneriler', '『😡』Şikayet', '『📺』Anime', '『🌈』Yemek Tarifleri'] },
        { name: '🎵 | Ses Kanalları', channels: ['🗣️ ┃ Genel Sohbet ', '🗣️ ┃ oyun-merkezi', '🗣️ ┃ turnuvalar', '🗣️ ┃ sesli-lobi', '🎶 ┃ müzik', '🗣️ ┃ Çalışma Salonu'] }
    ];

    try {
        await Promise.all(interaction.guild.channels.cache.map(channel => channel.deletable ? channel.delete() : Promise.resolve()));
    } catch (error) {
    }

    let generalChannel = null;

    for (const categoryData of categoriesToCreate) {
        try {
            const category = await interaction.guild.channels.create({
                name: categoryData.name,
                type: ChannelType.GuildCategory
            });

            for (const channelName of categoryData.channels) {
                const isVoiceChannel = channelName.startsWith('🗣️') || channelName.startsWith('🎶');
                const channelOptions = {
                    name: channelName,
                    type: isVoiceChannel ? ChannelType.GuildVoice : ChannelType.GuildText,
                    parent: category
                };

                const channel = await interaction.guild.channels.create(channelOptions);

                if (channelName === '『💬』genel-sohbet') {
                    generalChannel = channel;
                }
            }

        } catch (error) {
        }
    }

    if (generalChannel) {
        await generalChannel.send('Kanal kurulum işlemi tamamlandı.');
    } else {
        await interaction.user.send('Kanal kurulum işlemi tamamlandı, ancak genel sohbet kanalı oluşturulamadı.').catch(console.error);
    }
}

async function emojiSetup(interaction) {
    const emojiFolder = path.join(__dirname, '../../emojiler');
    fs.readdir(emojiFolder, async (err, files) => {
        if (err) {
            console.error('Emoji klasörü okunamadı:', err);
            return interaction.followUp({ content: 'Emoji yükleme sırasında bir hata oluştu.', ephemeral: true });
        }

        for (const file of files) {
            let emojiName = path.parse(file).name;

            // Sanitize emoji name: remove invalid characters (only alphanumeric and underscores allowed)
            emojiName = emojiName.replace(/[^a-zA-Z0-9_]/g, '');

            // Ensure name is within Discord's 2-32 character limit
            if (emojiName.length < 2) emojiName = `emoji_${emojiName}`;
            if (emojiName.length > 32) emojiName = emojiName.substring(0, 32);

            const existingEmoji = interaction.guild.emojis.cache.find(e => e.name === emojiName);
            if (existingEmoji) {
                console.log(`Bu isimde bir emoji zaten var: ${emojiName}, atlanıyor.`);
                continue; 
            }

            const emojiPath = path.join(emojiFolder, file);
            try {
                await interaction.guild.emojis.create({ attachment: emojiPath, name: emojiName });
                console.log(`Yeni emoji oluşturuldu: ${emojiName}`);

                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error(`${emojiName} emojisi oluşturulurken hata oluştu:`, error);
            }
        }

        interaction.followUp({ content: 'Emoji yükleme işlemi tamamlandı.', ephemeral: true });
    });
}
