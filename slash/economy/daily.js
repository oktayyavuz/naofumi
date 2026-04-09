const { EmbedBuilder, Colors } = require("discord.js");
const db = require("croxydb");

module.exports = {
    name: "günlük",
    description: "Günlük ödülünüzü alırsınız.",
    run: async (client, interaction) => {
        const economyEnabled = db.get("economyEnabled");

        if (!economyEnabled) {
            return interaction.reply({ content: "Ekonomi sistemi şu anda kapalı.", ephemeral: true });
        }

        let userData = db.get(`economy_${interaction.user.id}`);

        if (!userData) {
            userData = {
                money: 0,
                level: 1,
                lastDailyClaim: null
            };
        }

        const today = new Date().toDateString();

        if (userData.lastDailyClaim === today) {
            return interaction.reply({ content: "Günlük ödülünüzü zaten aldınız. Lütfen yarın tekrar gelin.", ephemeral: true });
        }

        const reward = 2000;
        userData.money += reward;
        userData.lastDailyClaim = today;

        db.set(`economy_${interaction.user.id}`, userData);

        const embed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setDescription(`Günlük ödül olarak **${reward} okane** kazandınız!`);

        interaction.reply({ embeds: [embed] });
    }
};
