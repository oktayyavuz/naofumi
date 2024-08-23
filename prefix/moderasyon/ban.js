const { EmbedBuilder, Colors, PermissionsBitField } = require("discord.js");

exports.run = async (client, message, args) => {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
        return message.reply("Üyeleri yasaklamak için izniniz yok.");
    }

    const targetUser = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!targetUser) {
        return message.reply("Lütfen yasaklanacak bir kullanıcı belirtin.");
    }

    if (targetUser.roles.highest.position >= message.member.roles.highest.position) {
        return message.reply("Kendinizden yüksek veya eşit role sahip bir üyeyi yasaklayamazsınız.");
    }

    const reason = args.slice(1).join(" ") || "Sebep belirtilmedi.";

    try {
        await targetUser.ban({ reason });
        const embed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setDescription(`**${targetUser.user.tag} yasaklandı.**\nSebep: ${reason}`)
            .setImage('https://i.hizliresim.com/oekcos5.gif')
            .setTimestamp();
        message.reply({ embeds: [embed] });

    } catch (error) {
        console.error("Üye yasaklanırken hata oluştu:", error);
        message.reply("Üye yasaklanmaya çalışılırken bir hata oluştu.");
    }
};

exports.conf = {
    aliases: ["yasakla","ban"] 
};

exports.help = {
    name: "ban"
};