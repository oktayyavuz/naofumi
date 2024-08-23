const { PermissionsBitField, EmbedBuilder, Colors } = require("discord.js");

exports.run = async (client, message, args) => {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        return message.reply("Bu komutu kullanmak için 'Kanalları Yönet' yetkisine ihtiyacınız var.");
    }

    const channel = message.channel;

    try {
        const currentPermission = channel.permissionsFor(message.guild.roles.everyone).has(PermissionsBitField.Flags.SendMessages);

        if (currentPermission) {
            const embed = new EmbedBuilder()
                .setColor(Colors.Red)
                .setDescription(`**${channel.name} kanalı zaten açık.**\nBu kanal zaten mesaj gönderimine izin veriyor.`)
                .setTimestamp();
            return message.reply({ embeds: [embed] });
        }

        await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
            SendMessages: true
        });

        const embed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setDescription(`**${channel.name} kanalı kilidi açıldı.**\nArtık bu kanalda mesaj gönderilebilir.`)
            .setTimestamp();
        message.reply({ embeds: [embed] });

    } catch (error) {
        console.error("Kanalın kilidi açılırken bir hata oluştu:", error);
        const embed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setDescription("Kanalın kilidi açılırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.")
            .setTimestamp();
        message.reply({ embeds: [embed] });
    }
};

exports.conf = {
    aliases: ["kilit-aç", "unlock"]
};

exports.help = {
    name: "kilidaç"
};
