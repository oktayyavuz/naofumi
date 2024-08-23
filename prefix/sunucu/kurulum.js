const { PermissionsBitField, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');

exports.run = async (client, message, args) => {
    if (message.author.id !== message.guild.ownerId) {
        return message.reply('Bu komutu sadece sunucu sahibi kullanabilir.');
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

    const setupMessage = await message.reply({
        content: 'Lütfen yapmak istediğiniz kurulum işlemini seçin:',
        components: [selectMenu],
    });

    const filter = i => i.user.id === message.author.id;
    const collector = setupMessage.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async interaction => {
        if (interaction.customId === 'setup') {
            const choice = interaction.values[0];
            await interaction.deferUpdate();

            const confirmEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Kurulum Onayı')
                .setDescription(`${choice.replace('_', ' ')} işlemini başlatmak istediğinizden emin misiniz? Onaylamak için 5 saniye içinde "eminim" yazın.`);

            await interaction.followUp({ embeds: [confirmEmbed] });

            const messageCollector = interaction.channel.createMessageCollector({
                filter: m => m.author.id === message.author.id,
                time: 5000,
                max: 1
            });

            messageCollector.on('collect', async m => {
                if (m.content.toLowerCase() === 'eminim') {
                    switch (choice) {
                        case 'role_setup':
                            await roleSetup(message);
                            break;
                        case 'channel_setup':
                            await channelSetup(message);
                            break;
                        case 'emoji_setup':
                            await emojiSetup(message);
                            break;
                    }
                } else {
                    message.reply('Kurulum işlemi iptal edildi.');
                }
            });

            messageCollector.on('end', collected => {
                if (collected.size === 0) {
                    message.reply('Zaman aşımı: Kurulum işlemi iptal edildi.');
                }
            });
        }
    });
};

async function roleSetup(message) {
    message.reply('Rol kurulum işlemi başlatılıyor...');

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
    
    message.guild.roles.cache.forEach(async (role) => {
        if (role.name !== '@everyone' && !role.managed) {
            try {
                await role.delete();
            } catch (error) {
            }
        }
    });
    for (const roleData of rolesToCreate) {
        try {
            const createdRole = await message.guild.roles.create({
                name: roleData.name,
                color: roleData.color,
                permissions: roleData.permissions,
                hoist: roleData.hoist 
            });

            if (roleData.name === '☢️ Mute') {
                message.guild.channels.cache.forEach(async (channel) => {
                    await channel.permissionOverwrites.edit(createdRole, {
                        SendMessages: false
                    });
                });
            }

        } catch (error) {
        }
    }

    message.reply('Rol kurulum işlemi tamamlandı.');
}


async function channelSetup(message) {
    if (message.guild.features.includes('COMMUNITY')) {
        return message.reply('Bu sunucu bir topluluk sunucusu olduğu için kanal kurulumu yapılamaz.');
    }

    await message.reply('Kanal kurulum işlemi başlatılıyor...');

    const categoriesToCreate = [
        { name: '📢 | Bilgilendirme', channels: ['『📜』kurallar', '『📣』duyurular', '『👋』hoşgeldin', '『📊』Oylama', '『🎊』etkinlikler'] },
        { name: '💬 | Genel', channels: ['『💬』genel-sohbet', '『🤖』bot-komutları', '『📸』fotoğraf-sergisi', '『💁』genel-destek', '『💡』Öneriler', '『😡』Şikayet', '『📺』Anime', '『🌈』Yemek Tarifleri'] },
        { name: '🎵 | Ses Kanalları', channels: ['🗣️ ┃ Genel Sohbet ', '🗣️ ┃ oyun-merkezi', '🗣️ ┃ turnuvalar', '🗣️ ┃ sesli-lobi', '🎶 ┃ müzik', '🗣️ ┃ Çalışma Salonu'] }
    ];

    try {
        await Promise.all(message.guild.channels.cache.map(channel => channel.deletable ? channel.delete() : Promise.resolve()));
    } catch (error) {
    }

    let generalChannel = null;

    for (const categoryData of categoriesToCreate) {
        try {
            const category = await message.guild.channels.create({
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

                const channel = await message.guild.channels.create(channelOptions);

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
        await message.author.send('Kanal kurulum işlemi tamamlandı, ancak genel sohbet kanalı oluşturulamadı.').catch(console.error);
    }
}

async function emojiSetup(message) {
    const emojiFolder = path.join(__dirname, '../../emojiler');
    fs.readdir(emojiFolder, async (err, files) => {
        if (err) {
            console.error('Emoji klasörü okunamadı:', err);
            return message.reply('Emoji yükleme sırasında bir hata oluştu.');
        }

        for (const file of files) {
            const emojiName = path.parse(file).name;

            const existingEmoji = message.guild.emojis.cache.find(e => e.name === emojiName);
            if (existingEmoji) {
                console.log(`Bu isimde bir emoji zaten var: ${emojiName}, atlanıyor.`);
                continue; 
            }

            const emojiPath = path.join(emojiFolder, file);
            try {
                await message.guild.emojis.create({ attachment: emojiPath, name: emojiName });
                console.log(`Yeni emoji oluşturuldu: ${emojiName}`);

                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error(`${emojiName} emojisi oluşturulurken hata oluştu:`, error);
            }
        }

        message.reply('Emoji yükleme işlemi tamamlandı.');
    });
}


exports.conf = {
    aliases: ['setup']
};

exports.help = {
    name: 'kurulum'
};
