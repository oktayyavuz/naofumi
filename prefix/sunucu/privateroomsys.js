const { PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, UserSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const db = require('croxydb');
const client = require("../../index.js");

exports.run = async (client, message, args) => {
    if (message.author.id !== message.guild.ownerId) {
        return message.reply('Bu komutu sadece sunucu sahibi kullanabilir.');
    }


    const privateRoomCategoryId = await db.get(`privateRoomCategory_${message.guild.id}`);
    const privateRoomChannelId = await db.get(`privateRoomChannel_${message.guild.id}`);

    if (privateRoomCategoryId && privateRoomChannelId) {
        return message.reply('Özel oda sistemi zaten açık.');
    }
    
    const category = await message.guild.channels.create({
        name: 'Özel Oda',
        type: ChannelType.GuildCategory
    });

    const channel = await message.guild.channels.create({
        name: '🎧 Özel Oda Oluştur',
        type: ChannelType.GuildVoice,
        parent: category.id
    });

    await db.set(`privateRoomCategory_${message.guild.id}`, category.id);
    await db.set(`privateRoomChannel_${message.guild.id}`, channel.id);

    message.reply('Özel oda sistemi başarıyla kuruldu!');
};

client.on('voiceStateUpdate', async (oldState, newState) => {
    const channelId = await db.get(`privateRoomChannel_${newState.guild.id}`);
    if (!channelId) return;

    if (newState.channelId === channelId) {
        const category = newState.guild.channels.cache.get(await db.get(`privateRoomCategory_${newState.guild.id}`));
        const channel = await newState.guild.channels.create({
            name: `${newState.member.user.username}'nin odası`,
            type: ChannelType.GuildVoice,
            parent: category.id
        });

        await newState.setChannel(channel);
        await db.set(`privateRoom_${channel.id}`, newState.member.id);

        const controlPanel = await createControlPanel(channel, newState.member);
        await channel.send({ embeds: [controlPanel.embed], components: [controlPanel.row, controlPanel.row2] });
    }

    if (oldState.channel && await db.get(`privateRoom_${oldState.channelId}`)) {
        if (oldState.channel.members.size === 0) {
            const channelToDelete = oldState.guild.channels.cache.get(oldState.channelId);
            if (channelToDelete) {
                try {
                    await channelToDelete.delete();
                } catch (error) {
                    if (error.code === 10003) {
                        console.log('Kanal zaten silinmiş.');
                    } else {
                        console.error('Kanal silinirken bir hata oluştu:', error);
                    }
                }
            } else {
                console.log('Kanal zaten silinmiş.');
            }
            await db.delete(`privateRoom_${oldState.channelId}`);
        }
    }
    
});

async function createControlPanel(channel, owner) {
    const embed = new EmbedBuilder()
        .setTitle('Özel Oda Kontrol Paneli')
        .setDescription('Aşağıdaki butonları kullanarak odanızı yönetebilirsiniz.')
        .setColor('#0099ff');

        const isLocked = !channel.permissionsFor(channel.guild.roles.everyone).has(PermissionsBitField.Flags.Connect);
        const isMuted = !channel.permissionsFor(channel.guild.roles.everyone).has(PermissionsBitField.Flags.Speak);
        const canStream = channel.permissionsFor(channel.guild.roles.everyone).has(PermissionsBitField.Flags.Stream);
        const canCreateActivity = channel.permissionsFor(channel.guild.roles.everyone).has(PermissionsBitField.Flags.CreateEvents);

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder().setCustomId('lock').setEmoji('🔒').setStyle(isLocked ? ButtonStyle.Danger : ButtonStyle.Success),
            new ButtonBuilder().setCustomId('mute').setEmoji('🎙').setStyle(isMuted ? ButtonStyle.Danger : ButtonStyle.Success),
            new ButtonBuilder().setCustomId('stream').setEmoji('📹').setStyle(canStream ? ButtonStyle.Success : ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('activity').setEmoji('🚀').setStyle(canCreateActivity ? ButtonStyle.Success : ButtonStyle.Danger)
        );

    const row2 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder().setCustomId('editName').setEmoji('✒').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('limit').setEmoji('🔢').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('manage').setEmoji('👥').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('delete').setEmoji('🗑').setStyle(ButtonStyle.Danger)
        );

    return { embed, row, row2 };
}

client.on('interactionCreate', async interaction => {
    try {
        if (!interaction.isButton() && !interaction.isUserSelectMenu() && !interaction.isModalSubmit()) return;

        const channelId = interaction.channelId;
        const ownerId = await db.get(`privateRoom_${channelId}`);
        if (!ownerId) return;

        const member = interaction.member;
        if (member.id !== ownerId) {
            return interaction.reply({ content: 'Bu odanın sahibi değilsiniz!', ephemeral: true });
        }

        const channel = interaction.guild.channels.cache.get(channelId);
        if (!channel) {
            return interaction.reply({ content: 'Bu kanal artık mevcut değil.', ephemeral: true });
        }

        let responseMessage;
        let newButton;

        if (interaction.isButton()) {
            if (interaction.customId.startsWith('kick_')) {
                const userId = interaction.customId.split('_')[1];
                const user = await interaction.guild.members.fetch(userId);
                if (user && user.voice.channel) {
                    await user.voice.disconnect('Oda sahibi tarafından atıldı.');
                    responseMessage = `${user.user.tag} odadan atıldı.`;
                } else {
                    responseMessage = 'Kullanıcı ses kanalında değil.';
                }
                await interaction.reply({ content: responseMessage, ephemeral: true });
                return; 
            }
        
            if (interaction.customId.startsWith('mute_')) {
                const userId = interaction.customId.split('_')[1];
                const user = await interaction.guild.members.fetch(userId);
                if (user && user.voice.channel) {
                    const isMuted = user.voice.serverMute;
                    await user.voice.setMute(!isMuted, 'Oda sahibi tarafından susturuldu.');
                    responseMessage = `${user.user.tag} ${isMuted ? 'susturması kaldırıldı' : 'susturuldu'}.`;
                } else {
                    responseMessage = 'Kullanıcı ses kanalında değil.';
                }
                await interaction.reply({ content: responseMessage, ephemeral: true });
                return; 
            }
        
            if (interaction.customId.startsWith('deafen_')) {
                const userId = interaction.customId.split('_')[1];
                const user = await interaction.guild.members.fetch(userId);
                if (user && user.voice.channel) {
                    const isDeafened = user.voice.serverDeaf;
                    await user.voice.setDeaf(!isDeafened, 'Oda sahibi tarafından sağırlaştırıldı.');
                    responseMessage = `${user.user.tag} ${isDeafened ? 'sağırlaştırması kaldırıldı' : 'sağırlaştırıldı'}.`;
                } else {
                    responseMessage = 'Kullanıcı ses kanalında değil.';
                }
                await interaction.reply({ content: responseMessage, ephemeral: true });
                return; 
            }

            switch (interaction.customId) {
                case 'editName':
                    const modal = new ModalBuilder()
                        .setCustomId('nameModal')
                        .setTitle('Oda İsmini Değiştir');
    
                    const nameInput = new TextInputBuilder()
                        .setCustomId('newName')
                        .setLabel("Yeni oda ismi")
                        .setStyle(TextInputStyle.Short);
    
                    const firstActionRow = new ActionRowBuilder().addComponents(nameInput);
                    modal.addComponents(firstActionRow);
                    await interaction.showModal(modal);
                    break;
                case 'lock':
                    const isLocked = channel.permissionsFor(interaction.guild.roles.everyone).has(PermissionsBitField.Flags.Connect);
                    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { Connect: !isLocked });
                    responseMessage = isLocked ? 'Oda kilitlendi.' : 'Oda kilidi açıldı.';
                    newButton = ButtonBuilder.from(interaction.component).setStyle(isLocked ? ButtonStyle.Danger : ButtonStyle.Success);
                    break;
                case 'mute':
                    const isMuted = !channel.permissionsFor(interaction.guild.roles.everyone).has(PermissionsBitField.Flags.Speak);
                    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { Speak: isMuted });
                    responseMessage = isMuted ? 'Herkesin mikrofon izni açıldı.' : 'Herkesin mikrofonu kapatıldı.';
                    newButton = ButtonBuilder.from(interaction.component).setStyle(isMuted ? ButtonStyle.Success : ButtonStyle.Danger);
                    break;
                case 'stream':
                    const canStream = channel.permissionsFor(interaction.guild.roles.everyone).has(PermissionsBitField.Flags.Stream);
                    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { Stream: !canStream });
                    responseMessage = canStream ? 'Yayın açma izni kapatıldı.' : 'Yayın açma izni verildi.';
                    newButton = ButtonBuilder.from(interaction.component).setStyle(canStream ? ButtonStyle.Danger : ButtonStyle.Success);
                    break;
                case 'activity':
                    const canCreateActivity = channel.permissionsFor(interaction.guild.roles.everyone).has(PermissionsBitField.Flags.CreateEvents);
                    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { CreateEvents: !canCreateActivity });
                    responseMessage = canCreateActivity ? 'Etkinlik oluşturma izni kapatıldı.' : 'Etkinlik oluşturma izni açıldı.';
                    newButton = ButtonBuilder.from(interaction.component).setStyle(canCreateActivity ? ButtonStyle.Danger : ButtonStyle.Success);
                    break;
                case 'limit':
                    const limitModal = new ModalBuilder()
                        .setCustomId('limitModal')
                        .setTitle('Oda Limitini Ayarla');

                    const limitInput = new TextInputBuilder()
                        .setCustomId('newLimit')
                        .setLabel("Yeni oda limiti (0-99)")
                        .setStyle(TextInputStyle.Short);

                    const limitActionRow = new ActionRowBuilder().addComponents(limitInput);
                    limitModal.addComponents(limitActionRow);
                    await interaction.showModal(limitModal);
                    return; 
                case 'manage':
                    const userSelectMenu = new UserSelectMenuBuilder()
                        .setCustomId('userManage')
                        .setPlaceholder('Yönetilecek kullanıcıyı seçin')
                        .setMaxValues(1);  
                
                    await interaction.reply({ components: [new ActionRowBuilder().addComponents(userSelectMenu)], ephemeral: true });
                    return;
                case 'delete':
                    try {
                        if (channel) {
                            await channel.delete();
                            await db.delete(`privateRoom_${channelId}`);
                        } else {
                            console.log('Kanal zaten mevcut değil.');
                        }
                    } catch (error) {
                        console.error('Kanal silinirken bir hata oluştu:', error);
                    }
                    return; 
                default:
                    responseMessage = 'Bilinmeyen bir işlem gerçekleştirildi.';
                    await interaction.reply({ content: responseMessage, ephemeral: true });

            }

            if (newButton) {
                const existingComponents = interaction.message.components || [];
                
                const row = new ActionRowBuilder()
                    .addComponents(existingComponents.length > 0 ? existingComponents[0].components.map(component =>
                        component.customId === interaction.customId ? newButton : component
                    ) : [newButton]);
                
                const row2 = existingComponents.length > 1 ? new ActionRowBuilder()
                    .addComponents(existingComponents[1].components) : new ActionRowBuilder().addComponents();

                await interaction.update({ components: [row, row2] });
            }
            if (responseMessage) {
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({ content: responseMessage, ephemeral: true });
                } else {
                    await interaction.followUp({ content: responseMessage, ephemeral: true });
                }
            }
        
        } else if (interaction.isUserSelectMenu()) {
            await interaction.deferReply({ ephemeral: true });
            const userId = interaction.values[0];
            const user = await interaction.guild.members.fetch(userId);

            if (!user) {
                await interaction.editReply({ content: 'Kullanıcı bulunamadı.', ephemeral: true });
                return;
            }

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`kick_${userId}`)
                        .setLabel('Kickle')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId(`mute_${userId}`)
                        .setLabel('Sustur')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId(`deafen_${userId}`)
                        .setLabel('Sağırlaştır')
                        .setStyle(ButtonStyle.Secondary)
                );
        
            await interaction.editReply({ 
                content: `${user.user.tag} için işlem seçin:`, 
                components: [row] 
            });
        }  else if (interaction.isModalSubmit()) {
            if (interaction.customId === 'nameModal') {
                const newName = interaction.fields.getTextInputValue('newName');
                try {
                    await channel.setName(newName);
                    await interaction.reply({ content: `Oda ismi "${newName}" olarak değiştirildi.`, ephemeral: true });
                } catch (error) {
                    await interaction.reply({ content: 'Oda ismi değiştirilirken bir hata oluştu.', ephemeral: true });
                    console.error(error);
                }
            } else if (interaction.customId === 'limitModal') {
                const newLimit = parseInt(interaction.fields.getTextInputValue('newLimit'), 10);
                if (isNaN(newLimit) || newLimit < 0 || newLimit > 99) {
                    await interaction.reply({ content: 'Geçersiz limit değeri. Lütfen 0 ile 99 arasında bir sayı girin.', ephemeral: true });
                    return;
                }
                try {
                    await channel.setUserLimit(newLimit);
                    await interaction.reply({ content: `Oda limiti ${newLimit} olarak ayarlandı.`, ephemeral: true });
                } catch (error) {
                    await interaction.reply({ content: 'Oda limiti ayarlanırken bir hata oluştu.', ephemeral: true });
                    console.error(error);
                }
            }
        }
    } catch (error) {
        console.error('Interaction handling sırasında bir hata oluştu:', error);
        await interaction.reply({ content: 'Bir hata oluştu. Lütfen tekrar deneyin.', ephemeral: true });
    }
});



exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: [],
    permLevel: 0
};

exports.help = {
    name: 'özelodasistemi'
};
