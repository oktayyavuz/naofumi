const { EmbedBuilder, Colors } = require("discord.js");

module.exports = {
    name: "sunucupp",
    description: "Sunucunun profil resmini gösterir.",
    options: [],

    run: async (client, interactionOrMessage) => {
        const guild = interactionOrMessage.guild;

        if (!guild.icon) {
            return interactionOrMessage.reply("Bu sunucunun profil resmi yok.");
        }

        const embed = new EmbedBuilder()
            .setColor(Colors.Orange)
            .setTitle(`${guild.name} Sunucu Profil Resmi`)
            .setImage(guild.iconURL({ size: 1024, dynamic: true }));

        interactionOrMessage.reply({ embeds: [embed] });
    },
};
