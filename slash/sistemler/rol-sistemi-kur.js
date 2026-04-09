const {
    PermissionsBitField,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder
} = require("discord.js");
const db = require("croxydb");
const config = require("../../config");
const { createColorRoles, positionColorRoles, COLOR_PALETTE } = require("../../handlers/colorRoles");

module.exports = {
    name: "rol-sistemi-kur",
    description: "Buton ve select menü ile rol sistemi kurar.",
    options: [
        {
            name: "kanal",
            description: "Rol mesajının gönderileceği kanal",
            type: 7, // CHANNEL
            channel_types: [0], // GuildText
            required: true
        },
        {
            name: "roller",
            description: "Eklenecek roller (virgülle ayırarak birden fazla rol ID'si girebilirsiniz)",
            type: 3, // STRING
            required: false
        },
        {
            name: "renk-rolleri",
            description: "Renk rolleri sistemini aktifleştir",
            type: 5, // BOOLEAN
            required: false
        }
    ],
    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: "❌ Bu komutu kullanmak için 'Yönetici' yetkisine sahip olmalısınız.",
                ephemeral: true
            });
        }

        await interaction.deferReply({ ephemeral: true });

        const channel = interaction.options.getChannel("kanal");
        const rolesInput = interaction.options.getString("roller");
        const enableColorRoles = interaction.options.getBoolean("renk-rolleri") || false;

        // Destek Ekibi ve Özel Üye rollerini otomatik bul
        const supportRole = interaction.guild.roles.cache.find(r => r.name === 'Destek Ekibi');
        const memberRole = interaction.guild.roles.cache.find(r => r.name === 'Özel Üye');

        try {
            let colorRoles = [];
            let customRoles = [];

            // Custom rolleri parse et
            if (rolesInput) {
                const roleIds = rolesInput.split(',').map(id => id.trim());
                for (const roleId of roleIds) {
                    const role = interaction.guild.roles.cache.get(roleId);
                    if (role) {
                        customRoles.push(role);
                    }
                }
            }

            // Renk rolleri aktifse oluştur ve hiyerarşiyi ayarla
            if (enableColorRoles) {
                const statusEmbed = new EmbedBuilder()
                    .setColor(config.embedColor || '#5865F2')
                    .setDescription('🎨 Renk rolleri oluşturuluyor...');

                await interaction.editReply({ embeds: [statusEmbed] });

                colorRoles = await createColorRoles(interaction.guild);

                if (colorRoles.length > 0) {
                    await positionColorRoles(interaction.guild, colorRoles, supportRole, memberRole);
                }
            }

            // Rol sistemi mesajını oluştur
            const roleEmbed = new EmbedBuilder()
                .setTitle('🎭 Rol Sistemi')
                .setDescription(
                    '**Aşağıdaki butonlara tıklayarak veya menüden seçim yaparak rol alabilirsiniz!**\n\n' +
                    '🔹 Bir role sahipseniz, aynı butona/seçime tekrar tıklayarak rolü kaldırabilirsiniz.\n' +
                    (enableColorRoles ? '🎨 Renk rolleri için: Sadece bir renk rolüne sahip olabilirsiniz. Yeni bir renk seçtiğinizde eskisi otomatik olarak kaldırılır.\n' : '') +
                    '\n**Kurallar:**\n' +
                    '`1️⃣` Rolleri sorumlu bir şekilde kullanın.\n' +
                    '`2️⃣` Rol spam yapmayın.\n' +
                    '`3️⃣` Sunucu kurallarına uyun.'
                )
                .setColor(config.embedColor || '#5865F2')
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .setFooter({ text: 'Rol sistemi' })
                .setTimestamp();

            const components = [];

            // Custom roller için butonlar oluştur (maksimum 5 buton per row)
            if (customRoles.length > 0) {
                const buttonStyles = [ButtonStyle.Primary, ButtonStyle.Success, ButtonStyle.Secondary, ButtonStyle.Danger];

                for (let i = 0; i < customRoles.length; i += 5) {
                    const row = new ActionRowBuilder();
                    const chunk = customRoles.slice(i, i + 5);

                    chunk.forEach((role, index) => {
                        row.addComponents(
                            new ButtonBuilder()
                                .setCustomId(`role_${role.id}`)
                                .setLabel(role.name)
                                .setStyle(buttonStyles[(i + index) % buttonStyles.length])
                        );
                    });

                    components.push(row);
                }
            }

            // Renk rolleri select menüsü
            if (enableColorRoles && colorRoles.length > 0) {
                const colorOptions = colorRoles.map(role => {
                    const colorData = COLOR_PALETTE.find(c => c.name === role.name);
                    return new StringSelectMenuOptionBuilder()
                        .setLabel(role.name)
                        .setValue(role.id)
                        .setEmoji(colorData?.emoji || '🎨');
                });

                const colorSelectMenu = new StringSelectMenuBuilder()
                    .setCustomId('role_select_color')
                    .setPlaceholder('🎨 Bir renk rolü seçin')
                    .setMinValues(1)
                    .setMaxValues(1)
                    .addOptions(colorOptions);

                const colorRow = new ActionRowBuilder().addComponents(colorSelectMenu);
                components.push(colorRow);
            }

            // Mesajı gönder
            await channel.send({
                embeds: [roleEmbed],
                components: components
            });

            // Ayarları veritabanına kaydet
            await db.set(`roleSystem_${interaction.guild.id}`, {
                channelId: channel.id,
                colorRolesEnabled: enableColorRoles,
                colorRoleIds: colorRoles.map(r => r.id),
                customRoleIds: customRoles.map(r => r.id),
                supportRoleId: supportRole?.id || null,
                memberRoleId: memberRole?.id || null,
                setupDate: Date.now()
            });

            // Başarı mesajı
            const successEmbed = new EmbedBuilder()
                .setColor(config.embedSuccessColor || '#57F287')
                .setTitle('✅ Rol Sistemi Kuruldu')
                .setDescription(
                    `Rol sistemi başarıyla ${channel} kanalına kuruldu!\n\n` +
                    `**Ayarlar:**\n` +
                    `🎭 Custom Roller: ${customRoles.length > 0 ? customRoles.map(r => r.name).join(', ') : '❌ Yok'}\n` +
                    `🎨 Renk Rolleri: ${enableColorRoles ? '✅ Aktif (' + colorRoles.length + ' renk)' : '❌ Pasif'}\n` +
                    (supportRole ? `👥 Destek Ekibi: ${supportRole} (Otomatik bulundu)\n` : '⚠️ Destek Ekibi rolü bulunamadı\n') +
                    (memberRole ? `⭐ Özel Üye: ${memberRole} (Otomatik bulundu)\n` : '⚠️ Özel Üye rolü bulunamadı\n') +
                    `\n**Not:** ${customRoles.length > 0 ? 'Seçtiğiniz roller buton olarak eklendi.' : 'Rol eklemek için roller parametresini kullanın.'}`
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [successEmbed] });

        } catch (error) {
            console.error('Rol sistemi kurulum hatası:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor(config.embedErrorColor || '#ED4245')
                .setTitle('❌ Kurulum Hatası')
                .setDescription(
                    'Rol sistemi kurulurken bir hata oluştu.\n\n' +
                    '**Olası nedenler:**\n' +
                    '• Botun yeterli yetkisi yok\n' +
                    '• Kanal erişimi yok\n' +
                    '• Rol oluşturma yetkisi yok\n\n' +
                    `**Hata:** \`${error.message}\``
                );

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};
