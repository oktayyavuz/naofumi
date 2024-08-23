const { StringSelectMenuBuilder, ActionRowBuilder, ComponentType, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('croxydb');

module.exports = {
    name: "koruma",
    description: "Koruma sistemlerini aç/kapat.",
    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply("Bu komutu kullanmak için yönetici yetkisine sahip olmalısınız.");
        }

        const getOptions = () => [
            {
                label: 'Küfür Engel',
                description: 'Küfür engelleme sistemini aç/kapat.',
                value: 'kufur_engel',
                emoji: db.get(`kufur_engel_${interaction.guild.id}`) ? '✅' : '🚫',
            },
            {
                label: 'Caps Lock Engel',
                description: 'Caps lock engelleme sistemini aç/kapat.',
                value: 'capslock_engel',
                emoji: db.get(`capslock_engel_${interaction.guild.id}`) ? '✅' : '🔡',
            },
            {
                label: 'Spam Koruması',
                description: 'Spam koruma sistemini aç/kapat.',
                value: 'spam_koruma',
                emoji: db.get(`spam_koruma_${interaction.guild.id}`) ? '✅' : '⚠️',
            },
            {
                label: 'Link Engel',
                description: 'Link engelleme sistemini aç/kapat.',
                value: 'link_engel',
                emoji: db.get(`link_engel_${interaction.guild.id}`) ? '✅' : '🔗',
            },
            {
                label: 'Tümünü Aç/Kapat',
                description: 'Tüm koruma sistemlerini aç/kapat.',
                value: 'toggle_all',
                emoji: '🔄',
            }
        ];

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('koruma_sistemi')
                .setPlaceholder('Bir koruma sistemi seçin')
                .addOptions(getOptions())
        );

        const embed = new EmbedBuilder()
            .setTitle('🛡️ Koruma Sistemi Ayarları')
            .setDescription('Aşağıdaki menüden koruma sistemlerini açabilir veya kapatabilirsiniz.')
            .setColor('#0099ff')
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .setFooter({ text: `Komut ${interaction.user.tag} tarafından kullanıldı`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();

        const msg = await interaction.reply({ embeds: [embed], components: [row] });

        const filter = i => i.customId === 'koruma_sistemi' && i.user.id === interaction.user.id;
        const collector = msg.createMessageComponentCollector({ filter, componentType: ComponentType.StringSelect, time: 60000 });

        collector.on('collect', async i => {
            const selected = i.values[0];

            if (selected === 'toggle_all') {
                const allEnabled = getOptions().some(option => db.get(`${option.value}_${interaction.guild.id}`));
                const newStatus = !allEnabled;

                getOptions().forEach(option => {
                    if (option.value !== 'toggle_all') {
                        if (newStatus) {
                            db.set(`${option.value}_${interaction.guild.id}`, true);
                        } else {
                            db.delete(`${option.value}_${interaction.guild.id}`);
                        }
                    }
                });

                await i.reply({ content: `Tüm sistemler **${newStatus ? 'açıldı' : 'kapatıldı'}**!`, ephemeral: true });

            } else {
                let status = db.get(`${selected}_${interaction.guild.id}`);
                const newStatus = !status;

                if (newStatus) {
                    db.set(`${selected}_${interaction.guild.id}`, true);
                } else {
                    db.delete(`${selected}_${interaction.guild.id}`);
                }

                const systemName = getOptions().find(option => option.value === selected).label;
                await i.reply({ content: `${systemName} sistemi **${newStatus ? 'açıldı' : 'kapatıldı'}**!`, ephemeral: true });
            }

            const updatedRow = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('koruma_sistemi')
                    .setPlaceholder('Bir koruma sistemi seçin')
                    .addOptions(getOptions())
            );
            await msg.edit({ components: [updatedRow] });
        });

        collector.on('end', collected => {
            if (!collected.size) {
                msg.edit({ components: [] });
            }
        });
    },
};
