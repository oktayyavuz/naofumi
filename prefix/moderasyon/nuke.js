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

        await channel.delete();

        const newChannel = await message.guild.channels.create({
            name: channelName,
            type: channelType,
            parent: parentCategory,
            reason: 'Kanal nuke komutu ile yeniden oluşturuldu'
        });

        await newChannel.setPosition(position);

        const embed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setDescription(`**${channelName}** kanalı başarıyla silindi ve aynı kategoride ve sırada tekrar oluşturuldu.`)
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
        
        try {
            await message.channel.send({ embeds: [embed] });
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
