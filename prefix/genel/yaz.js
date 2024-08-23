exports.run = async (client, message, args) => {
    const text = args.join(" ");
    
    if (!text) {
        return message.reply("Lütfen botun göndermesini istediğiniz bir metin yazın.");
    }

    await message.delete();

    message.channel.send(text);
};

exports.conf = {
    aliases: ["say"]
};

exports.help = {
    name: "yaz",
    description: "Botun belirttiğiniz metni yazmasını sağlar.",
    usage: "yaz [metin]"
};