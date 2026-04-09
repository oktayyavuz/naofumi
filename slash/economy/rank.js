const { EmbedBuilder, Colors, ApplicationCommandOptionType } = require("discord.js");
const db = require("croxydb");

function calculateXpNeeded(level) {
    return 50 * level;
}

module.exports = {
    name: "rank",
    description: "Seviye ve bakiye durumunuzu gösterir.",
    options: [
        {
            name: "kullanıcı",
            description: "Durumuna bakmak istediğiniz kullanıcı.",
            type: ApplicationCommandOptionType.User,
            required: false
        }
    ],
    run: async (client, interaction) => {
        const economyEnabled = db.get("economyEnabled");

        if (!economyEnabled) {
            return interaction.reply({ content: "Ekonomi sistemi şu anda kapalı.", ephemeral: true });
        }

        const targetUser = interaction.options.getUser("kullanıcı") || interaction.user;
        let userData = db.get(`economy_${targetUser.id}`);

        if (!userData) {
            userData = {
                money: 0,
                level: 1,
                xp: 0
            };
        }

        const xpNeeded = calculateXpNeeded(userData.level);

        const embed = new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle(`${targetUser.username} - Seviye Durumu`)
            .setDescription(`${targetUser.id === interaction.user.id ? 'Mevcut bakiyeniz' : `${targetUser.username} kullanıcısının bakiyesi`} **${userData.money} okane**.`)
            .addFields(
                { name: 'Seviye', value: `${userData.level}`, inline: true },
                { name: 'XP', value: `${userData.xp} / ${xpNeeded}`, inline: true },
                { name: 'Gereken XP', value: `${xpNeeded - userData.xp}`, inline: true }
            )
            .setFooter({ text: `Level: ${userData.level} | XP: ${userData.xp} / ${xpNeeded}` });

        interaction.reply({ embeds: [embed] });
    }
};
