const db = require("croxydb");
const { EmbedBuilder, Colors } = require("discord.js");

function calculateXpNeeded(level) {
    return 50 * level;
}

function calculateLevelReward(level) {
    return 10000 + (level - 1) * 1000;
}

async function handleEconomy(message) {
    const economyEnabled = db.get("economyEnabled");
    if (!economyEnabled) return;

    let userData = db.get(`economy_${message.author.id}`) || {
        money: 0,
        level: 1,
        xp: 0,
        lastMessageDate: null,
        firstMessageBonusReceived: false
    };

    if (!userData.firstMessageBonusReceived) {
        userData.money += 10000;
        userData.firstMessageBonusReceived = true;

        const embed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setTitle("İlk Mesaj Bonusu!")
            .setDescription(`İlk mesaj bonusu olarak **10.000** okane kazandınız!`)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }

    const xpGained = 2;
    userData.xp += xpGained;

    const moneyGained = Math.floor(Math.random() * userData.level * 2) + userData.level;
    userData.money += moneyGained;

    let xpNeeded = calculateXpNeeded(userData.level);

    while (userData.xp >= xpNeeded) {
        userData.level++;
        userData.xp -= xpNeeded;
        xpNeeded = calculateXpNeeded(userData.level);

        const levelReward = calculateLevelReward(userData.level);
        userData.money += levelReward;

        const embed = new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle("Seviye Atladınız!")
            .setDescription(`Tebrikler ${message.author}! \n Yeni seviyeniz: **${userData.level}**.\nÖdül olarak **${levelReward}** okane kazandınız!\nBir sonraki seviyeye geçmek için gereken XP: **${xpNeeded}**`)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }

    db.set(`economy_${message.author.id}`, userData);
}

module.exports = { handleEconomy };
