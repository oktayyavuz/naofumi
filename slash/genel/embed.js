const { EmbedBuilder, Colors, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelType } = require('discord.js');
const db = require('croxydb');

module.exports = {
    name: "embed-oluştur",
    description: "Mesajlarınız için özelleştirilmiş bir embed oluşturun.",
    options: [
        {
            name: "renk",
            description: "Oluşturmak istediğiniz embedin rengini seçin.",
            type: 3, 
            required: false,
            choices: [
                { name: "Varsayılan", value: "0" },
                { name: "Beyaz", value: "16777215" },
                { name: "Açık Mavi", value: "1752220" },
                { name: "Yeşil", value: "5763719" },
                { name: "Mavi", value: "3447003" },
                { name: "Sarı", value: "16705372" },
                { name: "Mor", value: "10181046" },
                { name: "Kırmızı", value: "15158332" },
                { name: "Siyah", value: "2303786" }
            ]
        },
        {
            name: "küçükresim",
            description: "Embedin sağ üstünde küçük resim istiyorsanız resim URL'si girin.",
            type: 3, 
            required: false
        },
        {
            name: "büyükresim",
            description: "Embedin altında büyük resim istiyorsanız resim URL'si girin.",
            type: 3, 
            required: false
        },
        {
            name: "oluşturan",
            description: "Embedi sizin oluşturduğunuz gösterilsin mi?",
            type: 5, 
            required: false
        },
        {
            name: "tarih",
            description: "Embedin altında embedin atıldığı tarih gösterilsin mi?",
            type: 5,
            required: false
        },
        {
            name: "kanal",
            description: "Embed başka bir kanala gönderilsin istiyorsanız bir kanal seçin.",
            type: 7,
            channelTypes: [ChannelType.GuildText],
            required: false
        }
    ],
    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: 'Bu komutu kullanmak için yönetici olmalısınız.', ephemeral: true });
        }

        const renk = interaction.options.getString('renk') || Colors.Default;
        const küçükresim = interaction.options.getString('küçükresim');
        const büyükresim = interaction.options.getString('büyükresim');
        const oluşturan = interaction.options.getBoolean('oluşturan');
        const tarih = interaction.options.getBoolean('tarih') ? new Date() : null; // Tarihi doğru şekilde ayarlıyoruz
        const kanal = interaction.options.getChannel('kanal') || interaction.channel;

        const modal = new ModalBuilder()
            .setCustomId('embedCreateModal')
            .setTitle('Embed Oluştur');

        const titleInput = new TextInputBuilder()
            .setCustomId('embedTitleInput')
            .setLabel('Başlık')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const descriptionInput = new TextInputBuilder()
            .setCustomId('embedDescriptionInput')
            .setLabel('Açıklama')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false);

        const modalRow1 = new ActionRowBuilder().addComponents(titleInput);
        const modalRow2 = new ActionRowBuilder().addComponents(descriptionInput);

        modal.addComponents(modalRow1, modalRow2);

        await interaction.showModal(modal);

        client.on('interactionCreate', async (modalInteraction) => {
            if (!modalInteraction.isModalSubmit()) return;
            if (modalInteraction.customId !== 'embedCreateModal') return;

            const title = modalInteraction.fields.getTextInputValue('embedTitleInput');
            const description = modalInteraction.fields.getTextInputValue('embedDescriptionInput');

            try {
                const embed = new EmbedBuilder()
                    .setColor(parseInt(renk)) 
                    .setTimestamp(tarih);

                if (title) embed.setTitle(title);
                if (description) embed.setDescription(description);
                if (küçükresim) embed.setThumbnail(küçükresim);
                if (büyükresim) embed.setImage(büyükresim);
                if (oluşturan) embed.setFooter({ text: `Oluşturan: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

               

                await kanal.send({ embeds: [embed]});
                await modalInteraction.reply({ content: 'Embed başarıyla oluşturuldu!', ephemeral: true });

            } catch (error) {
                console.error('Embed oluşturulurken hata oluştu:', error);
                await modalInteraction.reply({ content: 'Embed oluşturulurken bir hata oluştu.', ephemeral: true });
            }
        });
    }
};
