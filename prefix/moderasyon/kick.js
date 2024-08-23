const { EmbedBuilder, Colors, PermissionsBitField } = require("discord.js");

exports.run = async (client, message, args) => {
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
        return message.reply("Üyeleri atmak için izniniz yok.");
    }

    const targetUser = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!targetUser) {
        return message.reply("Lütfen atılacak bir kullanıcı belirtin.");
    }

    const botMember = message.guild.members.cache.get(client.user.id);

    if (targetUser.roles.highest.position >= botMember.roles.highest.position) {
        return message.reply("Bu kullanıcıyı atamazsınız çünkü rolü benim rolümden yüksek veya eşit.");
    }

    if (targetUser.roles.highest.position >= message.member.roles.highest.position) {
        return message.reply("Kendinizden yüksek veya eşit role sahip bir üyeyi atamazsınız.");
    }

    const reason = args.slice(1).join(" ") || "Sebep belirtilmedi.";

    try {
        await targetUser.kick(reason);
        const embed = new EmbedBuilder()
            .setColor(Colors.Orange)
            .setDescription(`**${targetUser.user.tag} atıldı.**\nSebep: ${reason}`)
            .setImage('https://i.hizliresim.com/oekcos5.gif')
            .setTimestamp();
        message.reply({ embeds: [embed] });

    } catch (error) {
        if (error.code === 50013) { 
            console.error("Üye atılırken hata oluştu: Botun yetkisi yetersiz.");
            message.reply("Üye atılmaya çalışılırken bir hata oluştu: Botun yetkisi yetersiz.");
        } else {
            console.error("Üye atılırken hata oluştu:", error);
            message.reply("Üye atılmaya çalışılırken bir hata oluştu.");
        }
    }
};

exports.conf = {
    aliases: ["at", "kick"]
};

exports.help = {
    name: "kick"
};
