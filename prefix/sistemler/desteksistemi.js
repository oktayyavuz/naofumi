const { EmbedBuilder, PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('croxydb');
const transcript = require('discord-html-transcripts');
const client = require("../../index");

exports.run = async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return message.reply('❗ Bu komutu kullanmak için yönetici olmanız gerekiyor.');
    }

    const subCommand = args[0];

    if (!subCommand || (subCommand !== 'aç' && subCommand !== 'kapat')) {
        return message.reply('❗ Lütfen `n.desteksistemi aç` veya `n.desteksistemi kapat` komutlarını kullanın.');
    }

    const mevcutDestekVerisi = await db.get(`destekSistemi_${message.guild.id}`);

    if (subCommand === 'aç') {
        if (mevcutDestekVerisi) {
            return message.reply('⚠️ Destek sistemi zaten açık.');
        }

        let destekKategori = message.guild.channels.cache.find(c => c.name === 'Destek' && c.type === ChannelType.GuildCategory);
        let destekRol = message.guild.roles.cache.find(r => r.name === 'Destek Ekibi');
        let ticketLogKanal = message.guild.channels.cache.find(c => c.name === 'ticket-log' && c.type === ChannelType.GuildText);

        if (!destekRol) {
            destekRol = await message.guild.roles.create({
                name: 'Destek Ekibi',
                color: 'Blue',
                permissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel],
                reason: '📩 Destek sistemi için otomatik oluşturuldu.',
            });
        }

        if (!destekKategori) {
            destekKategori = await message.guild.channels.create({
                name: 'Destek',
                type: ChannelType.GuildCategory,
                reason: '📂 Destek sistemi için otomatik oluşturuldu.',
            });
        }

        if (!ticketLogKanal) {
            ticketLogKanal = await message.guild.channels.create({
                name: 'ticket-log',
                type: ChannelType.GuildText,
                parent: destekKategori.id,
                permissionOverwrites: [
                    {
                        id: message.guild.id,
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                    {
                        id: destekRol.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
                    },
                    {
                        id: message.guild.roles.everyone.id,
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                ],
                reason: '🗂️ Destek sistemi için otomatik oluşturuldu.',
            });
        }

        const destekKanal = await message.guild.channels.create({
            name: 'destek-oluştur',
            type: ChannelType.GuildText,
            parent: destekKategori.id,
            permissionOverwrites: [
                {
                    id: message.guild.id,
                    allow: [PermissionFlagsBits.ViewChannel],
                    deny: [PermissionFlagsBits.SendMessages],

                },
                {
                    id: destekRol.id,
                    allow: [PermissionFlagsBits.ViewChannel],
                }
            ],
            reason: '📬 Destek sistemi için otomatik oluşturuldu.',
        });

        const destekEmbed = new EmbedBuilder()
            .setTitle('🎫 Destek Talebi Oluştur')
            .setDescription('🔹 Yardım almak için aşağıdaki butona tıklayarak destek talebi oluşturabilirsiniz.\n\n**Kurallar:**\n\n`1️⃣` Lütfen destek talebinizi açık ve net bir şekilde belirtin.\n`2️⃣` Saygılı olun.\n`3️⃣` Gereksiz talep oluşturmayın.')
            .setColor('#0099ff')
            .setThumbnail(message.guild.iconURL({ dynamic: true }))
            .setFooter({ text: 'Herhangi bir sorun için lütfen Destek Ekibi ile iletişime geçin.' })
            .setTimestamp();

        const butonlar = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('ticket_create')
                .setLabel('🎫 Talep Oluştur')
                .setStyle(ButtonStyle.Primary)
        );

        await destekKanal.send({ embeds: [destekEmbed], components: [butonlar] });

        const embed = new EmbedBuilder()
            .setTitle('🎫 Destek Sistemi Açıldı')
            .setDescription('✅ Destek sistemi başarıyla açıldı!')
            .setColor('#0099ff')
            .setTimestamp();

        await db.set(`destekSistemi_${message.guild.id}`, {
            kategoriId: destekKategori.id,
            kanalId: destekKanal.id,
            rolId: destekRol.id,
            logKanalId: ticketLogKanal.id,
            talepSayisi: 0
        });

        return message.reply({ embeds: [embed] });

    } else if (subCommand === 'kapat') {
        if (!mevcutDestekVerisi) {
            return message.reply('⚠️ Destek sistemi zaten kapalı.');
        }
        const destekKategori = message.guild.channels.cache.get(mevcutDestekVerisi.kategoriId);
        const destekKanal = message.guild.channels.cache.get(mevcutDestekVerisi.kanalId);
        const destekRol = message.guild.roles.cache.get(mevcutDestekVerisi.rolId);
        const ticketLogKanal = message.guild.channels.cache.get(mevcutDestekVerisi.logKanalId);

        if (destekKategori) await destekKategori.delete('🛑 Destek sistemi kapatıldı.');
        if (destekKanal) await destekKanal.delete('🛑 Destek sistemi kapatıldı.');
        if (destekRol) await destekRol.delete('🛑 Destek sistemi kapatıldı.');
        if (ticketLogKanal) await ticketLogKanal.delete('🛑 Destek sistemi kapatıldı.');

        await db.delete(`destekSistemi_${message.guild.id}`);

        const embed = new EmbedBuilder()
            .setTitle('🎫 Destek Sistemi Kapatıldı')
            .setDescription('❌ Destek sistemi başarıyla kapatıldı.')
            .setColor('#FF0000')
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }
};

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    const destekVerisi = await db.get(`destekSistemi_${interaction.guild.id}`);
    if (!destekVerisi) return;

    if (interaction.customId === 'ticket_create') {
        const existingTicketData = await db.get(`ticket_${interaction.guild.id}_${interaction.user.id}`);
        if (existingTicketData && existingTicketData.status) {
            return interaction.reply({ content: '⚠️ Zaten açık bir destek talebiniz var.', ephemeral: true });
        }

        const talepSayisi = destekVerisi.talepSayisi + 1;

        const ticketChannel = await interaction.guild.channels.create({
            name: `ticket-${interaction.user.username}-${talepSayisi}`,
            type: ChannelType.GuildText,
            parent: interaction.channel.parent,
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: [PermissionFlagsBits.ViewChannel],
                },
                {
                    id: interaction.user.id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
                },
                {
                    id: destekVerisi.rolId,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
                }
            ],
        });

        const ticketEmbed = new EmbedBuilder()
            .setTitle('🎫 Destek Talebi')
            .setDescription('🔔 Destek ekibi sizinle kısa süre içinde ilgilenecektir.\n❌ Destek talebinizi kapatmak için aşağıdaki butonu kullanabilirsiniz.')
            .setColor('#0099ff')
            .setTimestamp()
            .setThumbnail(interaction.user.displayAvatarURL());

        const closeButton = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('ticket_close')
                .setLabel('❌ Talebi Kapat')
                .setStyle(ButtonStyle.Danger)
        );

        await ticketChannel.send({ content: `${interaction.user}`, embeds: [ticketEmbed], components: [closeButton] });

        await db.set(`ticket_${interaction.guild.id}_${interaction.user.id}`, {
            talepSayisi,
            acanKisiId: interaction.user.id,
            channelId: ticketChannel.id,
            status: true
        });

        await db.set(`destekSistemi_${interaction.guild.id}`, {
            ...destekVerisi,
            talepSayisi: talepSayisi
        });

        return interaction.reply({ content: `✅ Destek talebiniz açıldı: ${ticketChannel}`, ephemeral: true });
    } else if (interaction.customId === 'ticket_close') {
        const ticketChannel = interaction.channel;
        const ticketData = await db.get(`ticket_${interaction.guild.id}_${interaction.user.id}`);

        if (!ticketData || ticketData.channelId !== ticketChannel.id) {
            return interaction.reply({ content: 'Bu kanalı kapatma yetkiniz yok.', ephemeral: true });
        }

        const transcriptAttachment = await transcript.createTranscript(ticketChannel);

        const ticketLogChannel = interaction.guild.channels.cache.get(destekVerisi.logKanalId);
        if (ticketLogChannel) {
            const logEmbed = new EmbedBuilder()
                .setTitle(`🎫 Destek Talebi Kapatıldı: ${ticketChannel.name}`)
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: 'Talebi Açan Kişi', value: `<@${ticketData.acanKisiId}>`, inline: false },
                    { name: 'Açılış Tarihi', value: `<t:${Math.floor(ticketChannel.createdTimestamp / 1000)}:F>`, inline: false },
                    { name: 'Kapanış Tarihi', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false },
                    { name: 'Açık Kalma Süresi', value: `${Math.round((Date.now() - ticketChannel.createdTimestamp) / 60000)} dakika`, inline: false },
                    { name: 'Talebi Kapatan Kişi', value: `<@${interaction.user.id}>`, inline: false },
                )
                .setColor('#FF0000')
                .setTimestamp();

            await ticketLogChannel.send({ embeds: [logEmbed], files: [transcriptAttachment] });
        }

        await db.set(`ticket_${interaction.guild.id}_${interaction.user.id}`, {
            ...ticketData,
            status: false
        });
    
        const silmeButonu = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('ticket_delete')
                .setLabel('Desteği Sil')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('ticket_reopen')
                .setLabel('Talebi Tekrar Aç')
                .setStyle(ButtonStyle.Success)
        );
    
        await interaction.reply({ content: '> ✅ Destek talebi kapatıldı. Kanal 2 saniye sonra gizlenecek.', ephemeral: true });
    
        await ticketChannel.permissionOverwrites.set([
            {
                id: interaction.guild.id,
                deny: [PermissionFlagsBits.ViewChannel],
            },
            {
                id: interaction.user.id,
                deny: [PermissionFlagsBits.ViewChannel],
            },
        ]);
    
        setTimeout(async () => {
            await ticketChannel.send({ content: 'Desteği tamamen silmek veya tekrar açmak için aşağıdaki butonları kullanabilirsiniz.', components: [silmeButonu] });
        }, 2000);
    
        await db.delete(`ticket_${interaction.guild.id}_${ticketChannel.id}`);
    } else if (interaction.customId === 'ticket_delete') {
        await interaction.channel.delete();
    } else if (interaction.customId === 'ticket_reopen') {
        const ticketChannel = interaction.channel;

        await ticketChannel.permissionOverwrites.set([
            {
                id: interaction.guild.id,
                allow: [PermissionFlagsBits.ViewChannel],
            },
            {
                id: interaction.user.id,
                allow: [PermissionFlagsBits.ViewChannel],
            },
        ]);
        const silmeButonu = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('ticket_delete')
                .setLabel('Desteği Sil')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('ticket_reopen')
                .setLabel('Talebi Tekrar Aç')
                .setStyle(ButtonStyle.Success)
        );

        await interaction.update({ content: '> 🔓 Destek talebi tekrar açıldı.', components: [silmeButonu], ephemeral: true });
    }
});

exports.conf = {
    aliases: ["desteksistemi", "ticketsistemi"],
};

exports.help = {
    name: "desteksistemi",
};
