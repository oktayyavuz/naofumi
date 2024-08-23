const { EmbedBuilder, Colors } = require("discord.js");

module.exports = {
    name: "sunucubilgi",
    description: "Sunucu hakkında detaylı bilgi verir.",
    options: [], 
    run: async (client, interactionOrMessage) => {
        const guild = interactionOrMessage.guild;

        const roles = guild.roles.cache.sort((a, b) => b.position - a.position).map(role => role.toString());
        const channels = guild.channels.cache;
        const textChannels = channels.filter(channel => channel.type === 0).size;
        const voiceChannels = channels.filter(channel => channel.type === 2).size; 
        const categories = channels.filter(channel => channel.type === 4).size; 
        const stageChannels = channels.filter(channel => channel.type === 13).size; 
        const newsChannels = channels.filter(channel => channel.type === 5).size; 
        const publicThreads = channels.filter(channel => channel.type === 11).size; 
        const privateThreads = channels.filter(channel => channel.type === 12).size; 
        const forumChannels = channels.filter(channel => channel.type === 15).size; 
        const boosts = guild.premiumSubscriptionCount;
        const boostLevel = guild.premiumTier;

        const embed = new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle(`${guild.name} Sunucu Bilgisi`)
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .addFields(
                { name: "Sunucu Sahibi", value: `<@${guild.ownerId}>`, inline: true },
                { name: "Toplam Üye", value: `${guild.memberCount}`, inline: true },
                { name: "Toplam İnsan Üyesi", value: `${guild.members.cache.filter(member => !member.user.bot).size}`, inline: true },
                { name: "Toplam Bot Üyesi", value: `${guild.members.cache.filter(member => member.user.bot).size}`, inline: true },
                { name: "Sunucu ID", value: `${guild.id}`, inline: true },
                { name: "Oluşturulma Tarihi", value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: true },
                { name: "Toplam Roller", value: `${roles.length}`, inline: true },
                { name: "Toplam Kanal", value: `${channels.size}`, inline: true },
                { name: "Metin Kanalları", value: `${textChannels}`, inline: true },
                { name: "Sesli Kanallar", value: `${voiceChannels}`, inline: true },
                { name: "Kategori Kanalları", value: `${categories}`, inline: true },
                { name: "Sahne Kanalları", value: `${stageChannels}`, inline: true },
                { name: "Haber Kanalları", value: `${newsChannels}`, inline: true },
                { name: "Genel Konu Başlıkları", value: `${publicThreads}`, inline: true },
                { name: "Özel Konu Başlıkları", value: `${privateThreads}`, inline: true },
                { name: "Forum Kanalları", value: `${forumChannels}`, inline: true },
                { name: "Sunucu Boost Seviyesi", value: `${boostLevel}`, inline: true },
                { name: "Toplam Boost Sayısı", value: `${boosts}`, inline: true },
                { name: "En Yüksek Rol", value: `${roles[0]}`, inline: true },
                { name: "Sunucu Davet Bağlantısı", value: `${guild.vanityURLCode ? `https://discord.gg/${guild.vanityURLCode}` : "Özel davet bağlantısı yok."}`, inline: false }
            )
            .setFooter({ text: `Sunucu ID: ${guild.id}` })
            .setTimestamp();

        interactionOrMessage.reply({ embeds: [embed] });
    },
};
