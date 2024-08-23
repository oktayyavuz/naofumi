const { EmbedBuilder, Colors, PermissionsBitField } = require("discord.js");

exports.run = async (client, message, args) => {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
        return message.reply("Üyelerin timeout'unu kaldırmak için izniniz yok.");
    }

    const targetUser = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!targetUser) {
        return message.reply("Lütfen timeout'u kaldırılacak bir kullanıcı belirtin."); 
    }

    const reason = args.slice(1).join(" ") || "Sebep belirtilmedi.";

    try {
        await targetUser.timeout(null, reason); 
        const embed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setDescription(`**${targetUser.user.tag} adlı kullanıcının timeout'u kaldırıldı.**\nSebep: ${reason}`)
            .setImage('https://i.hizliresim.com/oekcos5.gif')
            .setTimestamp();
        message.reply({ embeds: [embed] });

    } catch (error) {
        if (error.code === 50013) { 
            console.error("Üyenin timeout'u kaldırılırken hata oluştu: Rolüm yetersiz.");
            message.reply("Üyenin timeout'u kaldırılmaya çalışılırken bir hata oluştu: Rolüm yetersiz.");
        } else {
            console.error("Üyenin timeout'u kaldırılırken hata oluştu:", error);
            message.reply("Üyenin timeout'u kaldırılmaya çalışılırken bir hata oluştu.");
        }
    }
};

exports.conf = {
    aliases: ["susturmayı-kaldır","untimeout","uto"] 
};

exports.help = {
    name: "untimeout"
};
