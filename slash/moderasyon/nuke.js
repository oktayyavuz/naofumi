const { PermissionsBitField, EmbedBuilder, Colors } = require("discord.js");

module.exports = {
    name: "nuke",
    description: "Kanalı siler ve aynı isimle aynı kategoride yeniden oluşturur.",
    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return interaction.reply({ content: "Bu komutu kullanmak için 'Kanalları Yönet' yetkisine ihtiyacınız var.", ephemeral: true });
        }

        const channel = interaction.channel;

        try {
            const channelName = channel.name;
            const channelType = channel.type;
            const parentCategory = channel.parent;
            const position = channel.position;


            await channel.delete();

            const newChannel = await interaction.guild.channels.create({
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
            }

            await interaction.editReply({ content: "Kanal başarıyla yeniden oluşturuldu.", embeds: [embed] });

        } catch (error) {
            const embed = new EmbedBuilder()
                .setColor(Colors.Red)
                .setDescription("Kanal silinirken veya yeniden oluşturulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin.")
                .setTimestamp();
            
            try {
                await interaction.editReply({ content: "Bir hata oluştu:", embeds: [embed] });
            } catch (sendError) {
            }
        }
    }
};
