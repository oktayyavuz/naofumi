const config = require("../config.js");
const client = require("../index.js");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
// Puppeteer is required but not used in the provided code, removing to reduce memory footprint if not needed.
// const puppeteer = require('puppeteer');

client.on("guildCreate", async (guild) => {
    try {
        if (!guild) return;
        const logChannel = await client.channels.fetch(config.logChannelId).catch(() => null);
        if (!logChannel) return console.error("Log kanalı bulunamadı!");

        const guildOwner = await guild.fetchOwner().catch(() => ({ user: { tag: "Bilinmiyor", id: "0" } }));
        const onlineMembers = guild.members.cache.filter(member => member.presence?.status !== 'offline').size;
        const totalUsers = client.users.cache.size;

        const embed = {
            color: 0x00FF00,
            title: "Sunucuya Eklendim!",
            description: `Bot, **${guild.name}** adlı sunucuya eklendi.`,
            fields: [
                { name: "Sunucu ID", value: guild.id, inline: true },
                { name: "Sunucu Sahibi", value: `${guildOwner.user.tag} (${guildOwner.user.id})`, inline: true },
                { name: "Toplam Üye Sayısı", value: guild.memberCount.toString(), inline: true },
                { name: "Çevrimiçi Üye Sayısı", value: onlineMembers.toString(), inline: true },
                { name: "Bot Sayısı", value: guild.members.cache.filter(member => member.user.bot).size.toString(), inline: true },
                { name: "Hizmet Verilen Kullanıcı Sayısı", value: totalUsers.toString(), inline: true },
                { name: "Toplam Sunucu Sayısı", value: client.guilds.cache.size.toString(), inline: true },
            ],
            timestamp: new Date(),
        };

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('transcriptButton')
                    .setLabel('Sunucu Transcriptini Oluştur')
                    .setStyle(ButtonStyle.Primary),
            );

        await logChannel.send({ embeds: [embed], components: [row] }).catch(console.error);
    } catch (error) {
        console.error("Sunucuya eklenme logu gönderilirken bir hata oluştu:", error);
    }
});

client.on("guildDelete", async (guild) => {
    try {
        const logChannel = client.channels.cache.get(config.logChannelId);
        if (!logChannel) return console.error("Log kanalı bulunamadı!");

        const embed = {
            color: 0xFF0000,
            title: "Sunucudan Çıkarıldım!",
            description: `Bot, **${guild.name}** adlı sunucudan çıkarıldı.`,
            fields: [
                { name: "Sunucu ID", value: guild.id, inline: true },
                { name: "Toplam Sunucu Sayısı", value: client.guilds.cache.size, inline: true },
            ],
            timestamp: new Date(),
        };

        logChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error("Sunucudan çıkarılma logu gönderilirken bir hata oluştu:", error);
    }
});

client.on('interactionCreate', async interaction => {
    try {
        if (!interaction.isButton()) return;

        if (interaction.customId === 'transcriptButton') {
            await interaction.deferReply({ ephemeral: true });

            const guild = interaction.guild;
            if (!guild) return await interaction.editReply("Bu komut sadece bir sunucuda kullanılabilir.");

            let transcript = `**${guild.name} Sunucusu Log'u**\n\n`;

            try {
                transcript += `Sunucu İsmi: ${guild.name}\n`;
                transcript += `Sunucu ID: ${guild.id}\n`;
                transcript += `Sunucu Sahibi: ${guild.ownerId}\n`;
                transcript += `Toplam Üye Sayısı: ${guild.memberCount}\n`;
                transcript += `Oluşturulma Tarihi: ${guild.createdAt.toLocaleDateString()}\n\n`;

                transcript += `**Kanallar**\n`;
                guild.channels.cache.forEach(channel => {
                    transcript += `- ${channel.name} (${channel.type})\n`;
                });
                transcript += `\n`;

                transcript += `**Roller**\n`;
                guild.roles.cache.forEach(role => {
                    transcript += `- ${role.name} (ID: ${role.id})\n`;
                });
                transcript += `\n`;

                transcript += `**Üyeler (Cache)**\n`;
                guild.members.cache.forEach(member => {
                    transcript += `- ${member.user.tag} (ID: ${member.id})\n`;
                });
                transcript += `\n`;

                const transcriptFilePath = `./transcript_${guild.id}_${Date.now()}.txt`;
                fs.writeFileSync(transcriptFilePath, transcript, 'utf-8');

                const attachmentTXT = new AttachmentBuilder(transcriptFilePath);

                await interaction.editReply({ content: 'Sunucu log\'u oluşturuldu!', files: [attachmentTXT] });

                // Temp file cleanup
                setTimeout(() => {
                    if (fs.existsSync(transcriptFilePath)) fs.unlinkSync(transcriptFilePath);
                }, 10000);

            } catch (error) {
                console.error("Log oluşturulurken bir hata oluştu:", error);
                await interaction.editReply('Log oluşturulurken bir hata oluştu.');
            }
        }
    } catch (interactionError) {
        console.error("Interaction handler error:", interactionError);
    }
});

