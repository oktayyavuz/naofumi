const { PermissionsBitField, EmbedBuilder, Colors } = require("discord.js");

exports.run = async (client, message, args) => {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        return message.reply("Bu komutu kullanmak için 'Kanalları Yönet' yetkisine ihtiyacınız var.");
    }

    const channel = message.channel;

    try {
        const channelName = channel.name;
        const channelType = channel.type;
        const parentCategory = channel.parent;
        const position = channel.position;

        // Delete the channel
        await channel.delete();

        // Create the new channel
        const newChannel = await message.guild.channels.create({
            name: channelName,
            type: channelType,
            parent: parentCategory,
            reason: 'Kanal nuke komutu ile yeniden oluşturuldu'
        });

        await newChannel.setPosition(position);

        const embed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setDescription(`**${channelName}** kanalı başarıyla silindi ve tekrar oluşturuldu.`)
            .setTimestamp();
        
        try {
            await newChannel.send({ embeds: [embed] });
        } catch (sendError) {
            console.error("Yeni kanala mesaj gönderilirken bir hata oluştu:", sendError);
        }

    } catch (error) {
        console.error("Kanal silinirken veya yeniden oluşturulurken bir hata oluştu:", error);
        
        const embed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setDescription("Kanal silinirken veya yeniden oluşturulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin.")
            .setTimestamp();
        
        // Only try to send message to message.channel if it wasn't deleted
        // message.channel.send might throw if the channel is gone.
        try {
            if (message.channel && !message.channel.partial && message.guild.channels.cache.has(message.channelId)) {
                await message.channel.send({ embeds: [embed] }).catch(() => {});
            } else {
                // Channel is likely deleted, send to user's DM instead
                await message.author.send({ embeds: [embed] }).catch(() => {});
            }
        } catch (sendError) {
            console.error("Hata mesajı gönderilirken bir hata oluştu:", sendError);
        }
    }
};

exports.conf = {
    aliases: ["nuke"]
};

exports.help = {
    name: "nuke"
};
