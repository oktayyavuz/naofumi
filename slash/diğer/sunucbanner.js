const { EmbedBuilder, Colors } = require("discord.js");

module.exports = {
    name: "sunucubanner",
    description: "Sunucunun banner'ını gösterir.",
    options: [],

    run: async (client, interactionOrMessage) => {
        const guild = interactionOrMessage.guild;

        if (!guild.banner) {
            return interactionOrMessage.reply("Bu sunucuda bir banner yok.");
        }

        const embed = new EmbedBuilder()
            .setColor(Colors.Purple)
            .setTitle(`${guild.name} Sunucu Banner`)
            .setImage(guild.bannerURL({ size: 1024 }));

        interactionOrMessage.reply({ embeds: [embed] });
    },
};
