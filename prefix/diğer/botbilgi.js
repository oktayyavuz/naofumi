const { EmbedBuilder, Colors, version: djsVersion } = require("discord.js");
const os = require("os");
const moment = require("moment");
const { website } = require("../../config.js");

exports.run = async (client, message) => {
    const guilds = client.guilds.cache.size;
    const users = client.users.cache.size;
    const channels = client.channels.cache.size;
    const uptime = moment.duration(client.uptime).humanize();
    const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const nodeVersion = process.version;
    const cpuModel = os.cpus()[0].model;
    const coreCount = os.cpus().length;
    const platform = os.platform();

    const embed = new EmbedBuilder()
        .setColor(Colors.Gold)
        .setTitle(`🤖 ${client.user.username} Bot İstatistikleri`)
        .setThumbnail(client.user.displayAvatarURL())
        .addFields(
            { name: "🌍 Toplam Sunucu", value: `\`${guilds}\``, inline: true },
            { name: "👥 Toplam Kullanıcı", value: `\`${users}\``, inline: true },
            { name: "💬 Toplam Kanal", value: `\`${channels}\``, inline: true },
            { name: "⏳ Uptime", value: `\`${uptime}\``, inline: true },
            { name: "🧠 Bellek Kullanımı", value: `\`${memoryUsage} MB\``, inline: true },
            { name: "🔧 Node.js Versiyonu", value: `\`${nodeVersion}\``, inline: true },
            { name: "📦 Discord.js Versiyonu", value: `\`${djsVersion}\``, inline: true },
            { name: "💻 İşletim Sistemi", value: `\`${platform}\``, inline: true },
            { name: "🖥️ CPU", value: `\`${cpuModel}\``, inline: true },
            { name: "⚙️ CPU Çekirdek Sayısı", value: `\`${coreCount}\``, inline: true },
        )
        .setFooter({
            text: `✨ ${client.user.username} ile daha fazlasını keşfedin!`,
            iconURL: client.user.displayAvatarURL(),
        })
        .setTimestamp();

    if (website) {
        embed.addFields({
            name: "🌐 Website",
            value: `[Websitemize göz atın](${website})`,
            inline: false,
        });
    }

    message.reply({ embeds: [embed] });
};

exports.conf = {
    aliases: ["botinfo", "istatistik", "bi", "botstat"],
};

exports.help = {
    name: "botbilgi",
    description: "Botun istatistiklerini gösterir.",
    usage: "botbilgi",
};
