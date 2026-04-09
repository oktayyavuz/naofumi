const { PermissionsBitField, ChannelType, EmbedBuilder, Colors } = require("discord.js");
const db = require("croxydb");

module.exports = {
    name: "log-kur",
    description: "Sunucu için gelişmiş log sistemini otomatik olarak kurar.",
    options: [],
    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: "Bu komutu kullanmak için 'Yönetici' yetkisine sahip olmalısınız.", ephemeral: true });
        }

        await interaction.deferReply();

        try {
            const guild = interaction.guild;

            // Kategori oluştur
            const category = await guild.channels.create({
                name: 'LOGS',
                type: ChannelType.GuildCategory,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                ],
            });

            // Kanalları oluştur
            const modLog = await guild.channels.create({
                name: 'mod-log',
                type: ChannelType.GuildText,
                parent: category.id
            });

            const messageLog = await guild.channels.create({
                name: 'message-log',
                type: ChannelType.GuildText,
                parent: category.id
            });

            const voiceLog = await guild.channels.create({
                name: 'voice-log',
                type: ChannelType.GuildText,
                parent: category.id
            });

            const serverLog = await guild.channels.create({
                name: 'server-log',
                type: ChannelType.GuildText,
                parent: category.id
            });

            // Veritabanına kaydet
            db.set(`log_mod_${guild.id}`, modLog.id);
            db.set(`log_message_${guild.id}`, messageLog.id);
            db.set(`log_voice_${guild.id}`, voiceLog.id);
            db.set(`log_server_${guild.id}`, serverLog.id);

            const embed = new EmbedBuilder()
                .setTitle("✅ Log Sistemi Kuruldu")
                .setDescription("Gerekli log kanalları başarıyla oluşturuldu ve veritabanına kaydedildi.")
                .addFields(
                    { name: 'Mod Log', value: `<#${modLog.id}>`, inline: true },
                    { name: 'Mesaj Log', value: `<#${messageLog.id}>`, inline: true },
                    { name: 'Ses Log', value: `<#${voiceLog.id}>`, inline: true },
                    { name: 'Sunucu Log', value: `<#${serverLog.id}>`, inline: true }
                )
                .setColor(Colors.Green)
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error("Log kurulum hatası:", error);
            await interaction.editReply({ content: "Sistem kurulurken bir hata oluştu." });
        }
    }
};
