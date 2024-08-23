const { EmbedBuilder, Colors, PermissionsBitField } = require("discord.js");

exports.run = async (client, message, args) => {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
        return message.reply("Üyelerin yasağını kaldırmak için izniniz yok.");
    }

    const targetUserId = args[0]; 
    if (!targetUserId) {
        return message.reply("Lütfen yasağı kaldırılacak kullanıcının ID'sini belirtin.");
    }

    const reason = args.slice(1).join(" ") || "Sebep belirtilmedi.";

    try {
        await message.guild.members.unban(targetUserId, reason);
        const embed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setDescription(`**ID'si ${targetUserId} olan kullanıcının yasağı kaldırıldı.**\nSebep: ${reason}`)
            .setImage('https://i.hizliresim.com/oekcos5.gif')
            .setTimestamp();
        message.reply({ embeds: [embed] });

    } catch (error) {
        console.error("Üyenin yasağı kaldırılırken hata oluştu:", error);
        message.reply("Üyenin yasağı kaldırılmaya çalışılırken bir hata oluştu.");
    }
};

exports.conf = {
    aliases: ["yasağı-kaldır","unban"] 
};

exports.help = {
    name: "unban"
};
