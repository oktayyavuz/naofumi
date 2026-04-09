const { PermissionFlagsBits } = require('discord.js');

// Renk paleti tanımları
const COLOR_PALETTE = [
    { name: '🔴 Kırmızı', color: '#E74C3C', emoji: '🔴' },
    { name: '🟠 Turuncu', color: '#E67E22', emoji: '🟠' },
    { name: '🟡 Sarı', color: '#F1C40F', emoji: '🟡' },
    { name: '🟢 Yeşil', color: '#2ECC71', emoji: '🟢' },
    { name: '🔵 Mavi', color: '#3498DB', emoji: '🔵' },
    { name: '🟣 Mor', color: '#9B59B6', emoji: '🟣' },
    { name: '🟤 Kahverengi', color: '#A0522D', emoji: '🟤' },
    { name: '⚫ Siyah', color: '#2C3E50', emoji: '⚫' },
    { name: '⚪ Beyaz', color: '#ECF0F1', emoji: '⚪' },
    { name: '🩷 Pembe', color: '#FF69B4', emoji: '🩷' }
];

/**
 * Renk rollerini oluşturur veya mevcut olanları bulur
 * @param {Guild} guild - Discord sunucusu
 * @returns {Promise<Array>} Oluşturulan/bulunan renk rolleri
 */
async function createColorRoles(guild) {
    const colorRoles = [];

    for (const colorData of COLOR_PALETTE) {
        // Önce mevcut rolü kontrol et
        let role = guild.roles.cache.find(r => r.name === colorData.name);

        if (!role) {
            // Rol yoksa oluştur
            try {
                role = await guild.roles.create({
                    name: colorData.name,
                    color: colorData.color,
                    permissions: [],
                    reason: '🎨 Renk rolleri sistemi için otomatik oluşturuldu.'
                });
                console.log(`✅ Renk rolü oluşturuldu: ${colorData.name}`);
            } catch (error) {
                console.error(`❌ Renk rolü oluşturulamadı (${colorData.name}):`, error);
                continue;
            }
        }

        colorRoles.push(role);
    }

    return colorRoles;
}

/**
 * Renk rollerinin hiyerarşisini ayarlar
 * Destek ekibi rolünün altında, özel üye rolünün üstünde konumlandırır
 * @param {Guild} guild - Discord sunucusu
 * @param {Array} colorRoles - Renk rolleri
 * @param {Role} supportRole - Destek ekibi rolü (referans)
 * @param {Role} memberRole - Özel üye rolü (referans)
 */
async function positionColorRoles(guild, colorRoles, supportRole, memberRole) {
    try {
        // Hedef pozisyonu belirle
        let targetPosition;

        if (supportRole && memberRole) {
            // Her iki rol de varsa, aralarına yerleştir
            // Destek ekibinin altı = destek ekibi pozisyonu - 1
            targetPosition = supportRole.position - 1;
        } else if (supportRole) {
            // Sadece destek ekibi varsa, onun altına
            targetPosition = supportRole.position - 1;
        } else if (memberRole) {
            // Sadece özel üye varsa, onun üstüne
            targetPosition = memberRole.position + 1;
        } else {
            // Hiçbiri yoksa, @everyone'ın biraz üstüne
            targetPosition = 5;
        }

        // Renk rollerini sırayla yerleştir
        for (let i = 0; i < colorRoles.length; i++) {
            const role = colorRoles[i];
            const newPosition = targetPosition + i;

            try {
                await role.setPosition(newPosition);
            } catch (error) {
                console.error(`❌ Rol pozisyonu ayarlanamadı (${role.name}):`, error);
            }
        }

        console.log(`✅ ${colorRoles.length} renk rolü hiyerarşiye yerleştirildi.`);
    } catch (error) {
        console.error('❌ Renk rolleri hiyerarşi hatası:', error);
    }
}

/**
 * Sunucudaki mevcut renk rollerini getirir
 * @param {Guild} guild - Discord sunucusu
 * @returns {Array} Renk rolleri
 */
function getColorRoles(guild) {
    const colorRoleNames = COLOR_PALETTE.map(c => c.name);
    return guild.roles.cache.filter(role => colorRoleNames.includes(role.name));
}

/**
 * Kullanıcının sahip olduğu renk rollerini kaldırır
 * @param {GuildMember} member - Sunucu üyesi
 * @param {Guild} guild - Discord sunucusu
 */
async function removeUserColorRoles(member, guild) {
    const colorRoles = getColorRoles(guild);
    const userColorRoles = member.roles.cache.filter(role => colorRoles.has(role.id));

    if (userColorRoles.size > 0) {
        try {
            await member.roles.remove(userColorRoles);
        } catch (error) {
            console.error('❌ Renk rolleri kaldırılamadı:', error);
            throw error;
        }
    }
}

module.exports = {
    COLOR_PALETTE,
    createColorRoles,
    positionColorRoles,
    getColorRoles,
    removeUserColorRoles
};
