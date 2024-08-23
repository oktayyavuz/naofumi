const { EmbedBuilder, Colors, PermissionsBitField } = require("discord.js");

exports.run = async (client, message, args) => {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
        return message.reply("Üyelere timeout uygulamak için izniniz yok.");
    }

    const targetUser = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!targetUser) {
        return message.reply("Lütfen timeout uygulanacak bir kullanıcı belirtin."); 
    }

    if (targetUser.roles.highest.position >= message.member.roles.highest.position) {
        return message.reply("Kendinizden yüksek veya eşit role sahip bir üyeye timeout uygulayamazsınız.");
    }

    const durationMs = parseDuration(args[1]); 
    if (!durationMs) {
        return message.reply("Lütfen geçerli bir süre belirtin (ör. 1h, 30m, 1d).");
    }

    const reason = args.slice(2).join(" ") || "Sebep belirtilmedi.";

    try {
        await targetUser.timeout(durationMs, reason);
        const embed = new EmbedBuilder()
            .setColor(Colors.Yellow)
            .setDescription(`**${targetUser.user.tag} ${durationMs / 1000 / 60} dakika süreyle timeout'a alındı.**\nSebep: ${reason}`)
            .setImage('https://i.hizliresim.com/oekcos5.gif')
            .setTimestamp();
        message.reply({ embeds: [embed] });

    } catch (error) {
        if (error.code === 50013) { 
            console.error("Üyeye timeout uygulanırken hata oluştu: Rolüm yetersiz.");
            message.reply("Üyeye timeout uygulanmaya çalışılırken bir hata oluştu: Rolüm yetersiz.");
        } else {
            console.error("Üyeye timeout uygulanırken hata oluştu:", error);
            message.reply("Üyeye timeout uygulanmaya çalışılırken bir hata oluştu.");
        }
    }
};

function parseDuration(durationString) {
    if (!durationString) return null;

    const match = durationString.match(/^(\d+)([hmsd])$/);
    if (!match) return null;

    const amount = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
        case 'h': return amount * 60 * 60 * 1000; 
        case 'm': return amount * 60 * 1000; 
        case 's': return amount * 1000;
        case 'd': return amount * 24 * 60 * 60 * 1000; 
        default: return null;
    }
}

exports.conf = {
    aliases: ["sustur","timeout","to"] 
};

exports.help = {
    name: "timeout"
};
