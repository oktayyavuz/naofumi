const { EmbedBuilder, Colors } = require("discord.js");

module.exports = {
    name: "kullanıcıbilgi",
    description: "Kullanıcı hakkında bilgi verir.",
    options: [
        {
            name: "kullanıcı",
            description: "Bilgi almak istediğiniz kullanıcıyı seçin.",
            type: 6, // USER
            required: false
        }
    ],

    run: async (client, interactionOrMessage) => {
        const user = interactionOrMessage.options?.getUser("kullanıcı") || interactionOrMessage.author;
        const member = interactionOrMessage.guild.members.cache.get(user.id);

        const embed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setTitle(`${user.username} Kullanıcı Bilgisi`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: "Kullanıcı Adı", value: `${user.tag}`, inline: true },
                { name: "Kullanıcı ID", value: `${user.id}`, inline: true },
                { name: "Katılma Tarihi", value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: false },
                { name: "Hesap Oluşturulma Tarihi", value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: false },
            )
            .setFooter({ text: `Kullanıcı ID: ${user.id}` })
            .setTimestamp();

        interactionOrMessage.reply({ embeds: [embed] });
    },
};
