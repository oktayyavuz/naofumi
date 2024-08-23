const { EmbedBuilder, Colors, PermissionsBitField } = require("discord.js");
const cron = require("node-cron");

let isStatsActive = false; 

exports.run = async (client, message, args) => {
    const guild = message.guild;
    const statsCategoryName = "📊 Sunucu İstatistikleri";
    
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        return message.reply("❌ Bu komutu kullanmak için `Kanalları Yönet` yetkisine sahip olmalısınız.");
    }

    if (!args[0] || !["aç", "kapat"].includes(args[0])) {
        return message.reply("❓ Geçersiz kullanım. Lütfen `aç` veya `kapat` alt komutlarını kullanın.");
    }

    if (args[0] === "aç") {
        if (isStatsActive) {
            return message.reply("⚠️ İstatistik kanalları zaten aktif.");
        }

        isStatsActive = true;

        let statsCategory = guild.channels.cache.find(channel => channel.name === statsCategoryName && channel.type === 4);
        if (!statsCategory) {
            statsCategory = await guild.channels.create({
                name: statsCategoryName,
                type: 4, 
                position: 0,
            });
        }

        const updateStats = async () => {
            const totalMembers = `🌍 Toplam Üye: ${guild.memberCount}`;
            const totalHumans = `👥 Toplam İnsan Üye: ${guild.members.cache.filter(m => !m.user.bot).size}`;
            const totalBots = `🤖 Toplam Bot: ${guild.members.cache.filter(m => m.user.bot).size}`;
            const totalChannels = `💬 Toplam Kanal: ${guild.channels.cache.size}`;
            const totalRoles = `🏷️ Toplam Rol: ${guild.roles.cache.size}`;

            const stats = [
                { name: totalMembers, position: 1 },
                { name: totalHumans, position: 2 },
                { name: totalBots, position: 3 },
                { name: totalChannels, position: 4 },
                { name: totalRoles, position: 5 }
            ];

            const existingChannels = guild.channels.cache.filter(channel => channel.parentId === statsCategory.id && channel.type === 2);
            for (const channel of existingChannels.values()) {
                await channel.delete();
            }

            for (const stat of stats) {
                await guild.channels.create({
                    name: stat.name,
                    type: 2, 
                    parent: statsCategory.id,
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone,
                            deny: [PermissionsBitField.Flags.Connect], 
                        },
                    ],
                });
            }
        };

        await updateStats();
        cron.schedule("*/5 * * * *", updateStats);

        const embed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setTitle("📊 İstatistik Kanalları Açıldı")
            .setDescription("Sunucu istatistikleri her 5 dakikada bir güncelleniyor.")
            .setFooter({ text: `${guild.name} İstatistikleri` })
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }

    if (args[0] === "kapat") {
        if (!isStatsActive) {
            return message.reply("⚠️ İstatistik kanalları zaten kapalı.");
        }

        isStatsActive = false;

        let statsCategory = guild.channels.cache.find(channel => channel.name === statsCategoryName && channel.type === 4);
        if (statsCategory) {
            const channelsToDelete = guild.channels.cache.filter(channel => channel.parentId === statsCategory.id);
            for (const channel of channelsToDelete.values()) {
                await channel.delete();
            }
            await statsCategory.delete();
        }

        const embed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setTitle("📊 İstatistik Kanalları Kapatıldı")
            .setDescription("Sunucu istatistikleri kanalları başarıyla kapatıldı.")
            .setFooter({ text: `${guild.name} İstatistikleri` })
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }
};

exports.conf = {
    aliases: [, "stats", "statkanalları","statschannels"],
};

exports.help = {
    name: "istatistikkanalları",
    description: "Sunucuda istatistik kanalları oluşturur ve günceller.",
    usage: "istatistikkanalları aç | kapat",
};
