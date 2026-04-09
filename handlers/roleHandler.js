const { EmbedBuilder } = require('discord.js');
const db = require('croxydb');
const { getColorRoles, removeUserColorRoles } = require('./colorRoles');
const config = require('../config');

/**
 * Buton etkileşimlerini işler
 * @param {Client} client - Discord client
 * @param {ButtonInteraction} interaction - Buton etkileşimi
 * @param {Array} params - Buton parametreleri
 */
async function handleButton(client, interaction, params) {
    try {
        await interaction.deferReply({ ephemeral: true });

        const [roleId] = params;

        if (!roleId) {
            return interaction.editReply({
                content: '❌ Geçersiz rol ID\'si.',
                ephemeral: true
            });
        }

        const role = interaction.guild.roles.cache.get(roleId);

        if (!role) {
            return interaction.editReply({
                content: '❌ Bu rol artık mevcut değil.',
                ephemeral: true
            });
        }

        const member = interaction.member;
        const hasRole = member.roles.cache.has(roleId);

        try {
            if (hasRole) {
                // Rolü kaldır
                await member.roles.remove(role);

                const embed = new EmbedBuilder()
                    .setColor(config.embedSuccessColor || '#57F287')
                    .setDescription(`✅ ${role} rolü başarıyla kaldırıldı.`);

                return interaction.editReply({ embeds: [embed] });
            } else {
                // Rolü ver
                await member.roles.add(role);

                const embed = new EmbedBuilder()
                    .setColor(config.embedSuccessColor || '#57F287')
                    .setDescription(`✅ ${role} rolü başarıyla verildi.`);

                return interaction.editReply({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Rol verme/kaldırma hatası:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor(config.embedErrorColor || '#ED4245')
                .setDescription('❌ Rol işlemi sırasında bir hata oluştu. Botun yeterli yetkiye sahip olduğundan emin olun.');

            return interaction.editReply({ embeds: [errorEmbed] });
        }
    } catch (error) {
        console.error('Buton işleme hatası:', error);
    }
}

/**
 * Select menü etkileşimlerini işler
 * @param {Client} client - Discord client
 * @param {SelectMenuInteraction} interaction - Select menü etkileşimi
 */
async function handleSelectMenu(client, interaction) {
    try {
        await interaction.deferReply({ ephemeral: true });

        const [, type] = interaction.customId.split('_');
        const selectedValues = interaction.values;

        if (!selectedValues || selectedValues.length === 0) {
            return interaction.editReply({
                content: '❌ Lütfen bir seçim yapın.',
                ephemeral: true
            });
        }

        const member = interaction.member;

        // Renk rolleri için özel işlem
        if (type === 'color') {
            return handleColorRoleSelection(interaction, member, selectedValues[0]);
        }

        // Normal roller için
        const roleId = selectedValues[0];
        const role = interaction.guild.roles.cache.get(roleId);

        if (!role) {
            return interaction.editReply({
                content: '❌ Bu rol artık mevcut değil.',
                ephemeral: true
            });
        }

        const hasRole = member.roles.cache.has(roleId);

        try {
            if (hasRole) {
                // Rolü kaldır
                await member.roles.remove(role);

                const embed = new EmbedBuilder()
                    .setColor(config.embedSuccessColor || '#57F287')
                    .setDescription(`✅ ${role} rolü başarıyla kaldırıldı.`);

                return interaction.editReply({ embeds: [embed] });
            } else {
                // Rolü ver
                await member.roles.add(role);

                const embed = new EmbedBuilder()
                    .setColor(config.embedSuccessColor || '#57F287')
                    .setDescription(`✅ ${role} rolü başarıyla verildi.`);

                return interaction.editReply({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Rol verme/kaldırma hatası:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor(config.embedErrorColor || '#ED4245')
                .setDescription('❌ Rol işlemi sırasında bir hata oluştu. Botun yeterli yetkiye sahip olduğundan emin olun.');

            return interaction.editReply({ embeds: [errorEmbed] });
        }
    } catch (error) {
        console.error('Select menü işleme hatası:', error);
    }
}

/**
 * Renk rolü seçimini işler
 * @param {SelectMenuInteraction} interaction - Select menü etkileşimi
 * @param {GuildMember} member - Sunucu üyesi
 * @param {string} roleId - Seçilen rol ID'si
 */
async function handleColorRoleSelection(interaction, member, roleId) {
    try {
        const role = interaction.guild.roles.cache.get(roleId);

        if (!role) {
            return interaction.editReply({
                content: '❌ Bu renk rolü artık mevcut değil.',
                ephemeral: true
            });
        }

        // Önce mevcut renk rollerini kaldır
        await removeUserColorRoles(member, interaction.guild);

        // Yeni renk rolünü ver
        await member.roles.add(role);

        const embed = new EmbedBuilder()
            .setColor(role.color)
            .setDescription(`✅ ${role} renk rolü başarıyla verildi. Önceki renk rollerin kaldırıldı.`);

        return interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error('Renk rolü verme hatası:', error);

        const errorEmbed = new EmbedBuilder()
            .setColor(config.embedErrorColor || '#ED4245')
            .setDescription('❌ Renk rolü işlemi sırasında bir hata oluştu. Botun yeterli yetkiye sahip olduğundan emin olun.');

        return interaction.editReply({ embeds: [errorEmbed] });
    }
}

module.exports = {
    handleButton,
    handleSelectMenu
};
