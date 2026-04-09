const { InteractionType, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");
const db = require('croxydb');
const client = require("../index.js");
const config = require("../config.js");

client.on("interactionCreate", async (interaction) => {
    // Sunucu dışı ve bot etkileşimlerini yoksay
    if (!interaction.guild) return;
    if (interaction.user.bot) return;

    // Komut etkileşimlerini işle
    if (interaction.type === InteractionType.ApplicationCommand) {
        const command = client.slashCommands.get(interaction.commandName);

        // Bakım modu kontrolü
        if (config.maintenance && interaction.user.id !== config.ownerID) {
            return interaction.reply({
                content: "❌ Bot şu anda bakım modunda. Lütfen daha sonra tekrar deneyin.",
                ephemeral: true
            });
        }

        if (command) {
            try {
                // Komut çalıştırma öncesi log
                console.log(`[/] ${interaction.user.tag} (${interaction.user.id}) ${interaction.commandName} komutunu kullandı`);

                // Komutu çalıştır
                await command.run(client, interaction);

            } catch (error) {
                console.error(`Komut hatası (${interaction.commandName}):`, error);

                // Hatayı kullanıcıya bildir
                const errorEmbed = new EmbedBuilder()
                    .setColor(config.embedErrorColor || "#ED4245")
                    .setTitle("❌ Komut Hatası")
                    .setDescription("Bu komut çalıştırılırken bir hata oluştu.")
                    .setFooter({ text: "Bu hata kaydedildi ve geliştiriciye bildirildi." })
                    .setTimestamp();

                try {
                    if (interaction.deferred || interaction.replied) {
                        await interaction.editReply({ embeds: [errorEmbed], ephemeral: true }).catch(() => { });
                    } else {
                        await interaction.reply({ embeds: [errorEmbed], ephemeral: true }).catch(() => { });
                    }
                } catch (replyError) {
                    console.error("Etkileşim cevaplama hatası:", replyError);
                }

                // Hata logunu günlük kanalına gönder
                try {
                    const logChannel = client.channels.cache.get(config.logChannelId);
                    if (logChannel) {
                        const logEmbed = new EmbedBuilder()
                            .setColor(config.embedErrorColor || "#ED4245")
                            .setTitle("Komut Hatası")
                            .setDescription(`**Komutu Kullanan:** ${interaction.user.tag} (${interaction.user.id})\n**Komut:** ${interaction.commandName}\n**Sunucu:** ${interaction.guild.name} (${interaction.guild.id})\n**Hata:** \`\`\`${error.stack || error}\`\`\``)
                            .setTimestamp();

                        await logChannel.send({ embeds: [logEmbed] }).catch(() => { });
                    }
                } catch (logError) {
                    console.error("Hata log kaydı başarısız:", logError);
                }
            }
        }
    }

    // Buton etkileşimlerini işle
    if (interaction.isButton()) {
        try {
            // Buton ID formatı: "action_parameter"
            const [action, ...params] = interaction.customId.split("_");

            // Buton işleyicileri
            switch (action) {
                case "giveaway":
                    // Çekiliş butonları
                    require("../handlers/giveawayButtons")(client, interaction, params);
                    break;

                case "role":
                    // Rol sistemi butonları
                    require("../handlers/roleHandler").handleButton(client, interaction, params);
                    break;

                // Diğer buton tipleri buraya eklenebilir

                case "edit-welcome-goodbye":
                    const modal = new ModalBuilder()
                        .setCustomId('welcomeGoodbyeModal')
                        .setTitle('Hoşgeldin ve Güle Güle Mesajlarını Düzenle');

                    const welcomeInput = new TextInputBuilder()
                        .setCustomId('welcomeMessageInput')
                        .setLabel('Hoşgeldin Mesajı')
                        .setStyle(TextInputStyle.Paragraph)
                        .setPlaceholder('Sunucumuza hoş geldin, {user}!')
                        .setRequired(false);

                    const goodbyeInput = new TextInputBuilder()
                        .setCustomId('goodbyeMessageInput')
                        .setLabel('Güle Güle Mesajı')
                        .setStyle(TextInputStyle.Paragraph)
                        .setPlaceholder('{user}, aramızdan ayrıldı. Kendisine iyi şanslar dileriz!')
                        .setRequired(false);

                    const modalRow1 = new ActionRowBuilder().addComponents(welcomeInput);
                    const modalRow2 = new ActionRowBuilder().addComponents(goodbyeInput);

                    modal.addComponents(modalRow1, modalRow2);
                    await interaction.showModal(modal);
                    break;

                default:
                    break;
            }
        } catch (error) {
            console.error("Buton etkileşim hatası:", error);
        }
    }

    // Menü seçim etkileşimlerini işle
    if (interaction.isStringSelectMenu()) {
        try {
            // Rol sistemi select menüleri
            if (interaction.customId.startsWith("role_select")) {
                require("../handlers/roleHandler").handleSelectMenu(client, interaction);
            }
        } catch (error) {
            console.error("Menü etkileşim hatası:", error);
        }
    }

    // Modal etkileşimlerini işle
    if (interaction.type === InteractionType.ModalSubmit) {
        if (interaction.customId === 'welcomeGoodbyeModal') {
            const welcomeMessage = interaction.fields.getTextInputValue('welcomeMessageInput');
            const goodbyeMessage = interaction.fields.getTextInputValue('goodbyeMessageInput');

            if (welcomeMessage) {
                await db.set(`welcomeMessage_${interaction.guild.id}`, welcomeMessage);
            } else {
                await db.delete(`welcomeMessage_${interaction.guild.id}`);
            }

            if (goodbyeMessage) {
                await db.set(`goodbyeMessage_${interaction.guild.id}`, goodbyeMessage);
            } else {
                await db.delete(`goodbyeMessage_${interaction.guild.id}`);
            }

            await interaction.reply({ content: 'Hoşgeldin ve Güle Güle mesajları başarıyla güncellendi!', ephemeral: true });
        }
    }
});
