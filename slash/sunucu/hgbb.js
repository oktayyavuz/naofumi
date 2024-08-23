const { EmbedBuilder, Colors, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const db = require('croxydb'); 

module.exports = {
    name: "hg-bb",
    description: "Sunucuya yeni katılan kullanıcılar için hoşgeldin ve güle güle mesajlarını ayarlar veya kapatır.",
    options: [
        {
            name: "işlem",
            description: "Hoşgeldin ve güle güle mesajları ayarla veya kapat.",
            type: 3, 
            required: true,
            choices: [
                { name: "Ayarla", value: "ayarla" },
                { name: "Kapat", value: "kapat" }
            ]
        },
        {
            name: "kanal",
            description: "Hoşgeldin ve güle güle mesajlarının gönderileceği kanal.",
            type: 7, 
            required: false
        }
    ],
    run: async (client, interaction) => {
        const işlem = interaction.options.getString('işlem');
        const channel = interaction.options.getChannel('kanal');

        if (işlem === 'ayarla') {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
                return interaction.reply({ content: 'Sunucuyu yönetmek için izniniz yok.', ephemeral: true });
            }

            if (!channel) {
                return interaction.reply({ content: 'Lütfen bir kanal seçin.', ephemeral: true });
            }

            try {
                await db.set(`welcomeChannel_${interaction.guild.id}`, channel.id);
                await db.set(`goodbyeChannel_${interaction.guild.id}`, channel.id);

                const embed = new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setDescription(`**Hoşgeldin ve Güle Güle Mesajları Kanalı:** ${channel}`)
                    .setTimestamp();

                const buttonRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('edit-welcome-goodbye')
                            .setLabel('Hoşgeldin-BB Mesajlarını Düzenle')
                            .setStyle(ButtonStyle.Primary)
                    );

                await interaction.reply({ embeds: [embed], components: [buttonRow] });

                client.on('interactionCreate', async (buttonInteraction) => {
                    if (!buttonInteraction.isButton()) return;
                    if (buttonInteraction.customId !== 'edit-welcome-goodbye') return;

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

                    await buttonInteraction.showModal(modal);
                });

                client.on('interactionCreate', async (modalInteraction) => {
                    if (!modalInteraction.isModalSubmit()) return;
                    if (modalInteraction.customId !== 'welcomeGoodbyeModal') return;

                    const welcomeMessage = modalInteraction.fields.getTextInputValue('welcomeMessageInput');
                    const goodbyeMessage = modalInteraction.fields.getTextInputValue('goodbyeMessageInput');

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

                    await modalInteraction.reply({ content: 'Hoşgeldin ve Güle Güle mesajları başarıyla güncellendi!', ephemeral: true });
                });

            } catch (error) {
                console.error('Hoşgeldin-BB mesajları ayarlanırken hata oluştu:', error);
                await interaction.reply({ content: 'Hoşgeldin-BB mesajları ayarlanırken bir hata oluştu.', ephemeral: true });
            }
        } else if (işlem === 'kapat') {
            try {
                await db.delete(`welcomeChannel_${interaction.guild.id}`);
                await db.delete(`goodbyeChannel_${interaction.guild.id}`);
                await db.delete(`welcomeMessage_${interaction.guild.id}`);
                await db.delete(`goodbyeMessage_${interaction.guild.id}`);

                await interaction.reply({ content: 'Hoşgeldin ve Güle Güle mesajları başarıyla kapatıldı!', ephemeral: true });
            } catch (error) {
                console.error('Hoşgeldin-BB mesajları kapatılırken hata oluştu:', error);
                await interaction.reply({ content: 'Hoşgeldin-BB mesajları kapatılırken bir hata oluştu.', ephemeral: true });
            }
        }
    }
};
