const { EmbedBuilder, Colors, PermissionsBitField } = require("discord.js");

module.exports = {
    name: "kilit",
    description: "Kanalın mesaj gönderme iznini kapatır veya açar.",
    options: [
        {
            name: "işlem",
            description: "Kanalı kilitleme veya kilidini açma işlemi.",
            type: 3, 
            required: true,
            choices: [
                { name: "kapat", value: "kapat" },
                { name: "aç", value: "aç" }
            ]
        }
    ],
    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return interaction.reply({ content: "Bu komutu kullanmak için 'Kanalları Yönet' yetkisine ihtiyacınız var.", ephemeral: true });
        }

        const operation = interaction.options.getString("işlem");
        const channel = interaction.channel;

        try {
            const currentPermission = channel.permissionsFor(interaction.guild.roles.everyone).has(PermissionsBitField.Flags.SendMessages);

            if (operation === "kapat") {
                if (!currentPermission) {
                    const embed = new EmbedBuilder()
                        .setColor(Colors.Red)
                        .setDescription(`**${channel.name} kanalı zaten kapalı.**\nBu kanal zaten mesaj gönderimine izin vermiyor.`)
                        .setTimestamp();
                    return interaction.reply({ embeds: [embed] });
                }

                await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                    SendMessages: false
                });

                const embed = new EmbedBuilder()
                    .setColor(Colors.Red)
                    .setDescription(`**${channel.name} kanalı kilitlendi.**\nBu kanalda artık mesaj gönderilemez.`)
                    .setTimestamp();
                return interaction.reply({ embeds: [embed] });

            } else if (operation === "aç") {
                if (currentPermission) {
                    const embed = new EmbedBuilder()
                        .setColor(Colors.Green)
                        .setDescription(`**${channel.name} kanalı zaten açık.**\nBu kanal zaten mesaj gönderimine izin veriyor.`)
                        .setTimestamp();
                    return interaction.reply({ embeds: [embed] });
                }

                await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                    SendMessages: true
                });

                const embed = new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setDescription(`**${channel.name} kanalı kilidi açıldı.**\nArtık bu kanalda mesaj gönderilebilir.`)
                    .setTimestamp();
                return interaction.reply({ embeds: [embed] });
            } else {
                return interaction.reply({ content: "Geçersiz işlem türü. Lütfen 'kapat' veya 'aç' seçin.", ephemeral: true });
            }

        } catch (error) {
            console.error("Kanalın kilidi açılırken veya kapanırken bir hata oluştu:", error);
            const embed = new EmbedBuilder()
                .setColor(Colors.Red)
                .setDescription("Kanalın kilidi açılırken veya kapanırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.")
                .setTimestamp();
            return interaction.reply({ embeds: [embed] });
        }
    }
};
