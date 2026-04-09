const { EmbedBuilder, PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('croxydb');
const transcript = require('discord-html-transcripts');

module.exports = {
    name: "desteksistemi",
    description: "Destek sistemi açma ve kapatma komutu",
    options: [
        {
            name: 'komut',
            description: 'Destek sistemini aç veya kapat',
            type: 3,
            required: true,
            choices: [
                {
                    name: 'aç',
                    value: 'aç'
                },
                {
                    name: 'kapat',
                    value: 'kapat'
                }
            ]
        }
    ],
    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: '❗ Bu komutu kullanmak için yönetici olmanız gerekiyor.', ephemeral: true });
        }
        const subCommand = interaction.options.getString('komut');

        const mevcutDestekVerisi = await db.get(`destekSistemi_${interaction.guild.id}`);

        if (subCommand === 'aç') {
            if (mevcutDestekVerisi) {
                return interaction.reply({ content: '⚠️ Destek sistemi zaten açık.', ephemeral: true });
            }

            let destekKategori = interaction.guild.channels.cache.find(c => c.name === 'Destek' && c.type === ChannelType.GuildCategory);
            let destekRol = interaction.guild.roles.cache.find(r => r.name === 'Destek Ekibi');
            let ticketLogKanal = interaction.guild.channels.cache.find(c => c.name === 'ticket-log' && c.type === ChannelType.GuildText);

            if (!destekRol) {
                destekRol = await interaction.guild.roles.create({
                    name: 'Destek Ekibi',
                    color: 'Blue',
                    permissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel],
                    reason: '📩 Destek sistemi için otomatik oluşturuldu.',
                });
            }

            if (!destekKategori) {
                destekKategori = await interaction.guild.channels.create({
                    name: 'Destek',
                    type: ChannelType.GuildCategory,
                    reason: '📂 Destek sistemi için otomatik oluşturuldu.',
                });
            }

            if (!ticketLogKanal) {
                ticketLogKanal = await interaction.guild.channels.create({
                    name: 'ticket-log',
                    type: ChannelType.GuildText,
                    parent: destekKategori.id,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: [PermissionFlagsBits.ViewChannel],
                        },
                        {
                            id: destekRol.id,
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
                        },
                        {
                            id: interaction.guild.roles.everyone.id,
                            deny: [PermissionFlagsBits.ViewChannel],
                        },
                    ],
                    reason: '🗂️ Destek sistemi için otomatik oluşturuldu.',
                });
            }

            const destekKanal = await interaction.guild.channels.create({
                name: 'destek-oluştur',
                type: ChannelType.GuildText,
                parent: destekKategori.id,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
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
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
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

            await db.set(`destekSistemi_${interaction.guild.id}`, {
                kategoriId: destekKategori.id,
                kanalId: destekKanal.id,
                rolId: destekRol.id,
                logKanalId: ticketLogKanal.id,
                talepSayisi: 0
            });

            return interaction.reply({ embeds: [embed], ephemeral: true });

        } else if (subCommand === 'kapat') {
            if (!mevcutDestekVerisi) {
                return interaction.reply({ content: '⚠️ Destek sistemi zaten kapalı.', ephemeral: true });
            }
            const destekKategori = interaction.guild.channels.cache.get(mevcutDestekVerisi.kategoriId);
            const destekKanal = interaction.guild.channels.cache.get(mevcutDestekVerisi.kanalId);
            const destekRol = interaction.guild.roles.cache.get(mevcutDestekVerisi.rolId);
            const ticketLogKanal = interaction.guild.channels.cache.get(mevcutDestekVerisi.logKanalId);

            if (destekKategori) await destekKategori.delete('🛑 Destek sistemi kapatıldı.');
            if (destekKanal) await destekKanal.delete('🛑 Destek sistemi kapatıldı.');
            if (destekRol) await destekRol.delete('🛑 Destek sistemi kapatıldı.');
            if (ticketLogKanal) await ticketLogKanal.delete('🛑 Destek sistemi kapatıldı.');

            await db.delete(`destekSistemi_${interaction.guild.id}`);

            const embed = new EmbedBuilder()
                .setTitle('🎫 Destek Sistemi Kapatıldı')
                .setDescription('❌ Destek sistemi başarıyla kapatıldı.')
                .setColor('#FF0000')
                .setTimestamp();

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};
