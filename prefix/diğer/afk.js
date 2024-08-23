const { EmbedBuilder, Colors } = require("discord.js");
const db = require("croxydb"); 

const client = require("../../index.js");
const { prefix } = require("../../config.js");

client.on('messageCreate', message => {
    if (message.author.bot || message.content.startsWith(prefix)) return;

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

exports.run = async (client, message, args) => {
    const reason = args.join(" ") || "Belirtilmedi";
    db.set(`afk_${message.author.id}`, { time: Date.now(), reason, count: 0 }); 

    const embed = new EmbedBuilder()
        .setColor(Colors.Blue)
        .setTitle("🔵 AFK Modundasın")
        .setDescription(`Sebep: **${reason}**\nBirisi seni etiketlediğinde AFK modundan çıkacaksın.`)
        .setFooter({ text: `Keyfini çıkar!` })
        .setTimestamp();

    message.reply({ embeds: [embed] });
};

exports.conf = {
    aliases: ["afk"],
};

exports.help = {
    name: "afk",
};

function formatDuration(duration) {
    const seconds = Math.floor((duration / 1000) % 60);
    const minutes = Math.floor((duration / (1000 * 60)) % 60);
    const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
    const days = Math.floor(duration / (1000 * 60 * 60 * 24));

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}
