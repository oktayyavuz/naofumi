const { EmbedBuilder, Colors, PermissionsBitField } = require("discord.js");

exports.run = async (client, message, args) => {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
        return message.reply("Mesajları yönetmek için izniniz yok.");
    }

    const deleteCount = parseInt(args[0], 10);
    if (!deleteCount || deleteCount < 1 || deleteCount > 100) {
        return message.reply("Lütfen 1 ile 100 arasında bir sayı belirtin.");
    }

    const fetched = await message.channel.messages.fetch({ limit: deleteCount });

    const messagesToDelete = fetched.filter(msg => {
        const now = new Date();
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        return msg.createdAt > twoWeeksAgo; 
    });

    try {
        await message.channel.bulkDelete(messagesToDelete); 

        await new Promise(resolve => setTimeout(resolve, 1500)); 

        const embed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setDescription(`**${messagesToDelete.size} mesaj silindi.**`)
            .setTimestamp();
        await message.channel.send({ embeds: [embed] }); 

    } catch (error) {
        console.error("Mesajlar silinirken hata oluştu:", error);
        if (error.code === 50013) { 
            message.reply("Bu kanaldaki mesajları silmek için yeterli iznim yok.");
        } else {
            message.reply("Mesajlar silinmeye çalışılırken bir hata oluştu.");
        }
    }
};

exports.conf = {
    aliases: ["temizle","clear"] 
};

exports.help = {
    name: "sil"
};