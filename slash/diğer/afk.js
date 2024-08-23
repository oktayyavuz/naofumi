const { EmbedBuilder, Colors } = require("discord.js");
const db = require("croxydb"); // Use croxydb for database operations

const client = require("../../index.js");

client.on('messageCreate', message => {
    if (message.author.bot || message.content.startsWith('/')) return;

    let afkData = db.get(`afk_${message.author.id}`);

    if (afkData && afkData.count === 0) {
        db.set(`afk_${message.author.id}.count`, 1);
    } else if (afkData) {
        const afkDuration = Date.now() - afkData.time;

        const embed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setTitle("🟢 Artık AFK Değilsin!")
            .setDescription(`**${afkData.reason}** sebebiyle AFK modundaydın.\nAFK kaldığın süre: \`${formatDuration(afkDuration)}\``)
            .setFooter({ text: `Hoş geldin!` })
            .setTimestamp();

        message.reply({ embeds: [embed] });

        db.delete(`afk_${message.author.id}`);
    }

    message.mentions.users.forEach(user => {
        const afkData = db.get(`afk_${user.id}`);
        if (afkData) {
            const afkDuration = Date.now() - afkData.time;

            const embed = new EmbedBuilder()
                .setColor(Colors.Yellow)
                .setTitle("🔕 Kullanıcı AFK")
                .setDescription(`**${user.username}** kullanıcısı şu an AFK.\nSebep: **${afkData.reason}**\nAFK kaldığı süre: \`${formatDuration(afkDuration)}\``)
                .setFooter({ text: `Lütfen bekleyin.` })
                .setTimestamp();

            message.reply({ embeds: [embed] });
        }
    });
});

module.exports = {
    name: "afk",
    description: "AFK moduna geçer ve belirttiğiniz sebebi gösterir.",
    options: [
        {
            name: "sebep",
            description: "AFK olma sebebiniz",
            type: 3,
            required: false
        }
    ],

    run: async (client, interaction) => {
        const reason = interaction.options.getString("sebep") || "Belirtilmedi";
        db.set(`afk_${interaction.user.id}`, { time: Date.now(), reason, count: 0 });

        const embed = new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle("🔵 AFK Modundasın")
            .setDescription(`Sebep: **${reason}**\nBirisi seni etiketlediğinde AFK modundan çıkacaksın.`)
            .setFooter({ text: `Keyfini çıkar!` })
            .setTimestamp();

        interaction.reply({ embeds: [embed] });
    },
};

function formatDuration(duration) {
    const seconds = Math.floor((duration / 1000) % 60);
    const minutes = Math.floor((duration / (1000 * 60)) % 60);
    const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
    const days = Math.floor(duration / (1000 * 60 * 60 * 24));

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}
