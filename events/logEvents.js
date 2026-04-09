const client = require("../index.js");
const db = require("croxydb");
const { EmbedBuilder, Colors, AuditLogEvent } = require("discord.js");

const getLogChannel = (guildId, type) => {
    const channelId = db.get(`log_${type}_${guildId}`);
    if (!channelId) return null;
    return client.channels.cache.get(channelId);
}

// 📌 MESAJ LOGLARI
// Mesaj Silme
client.on("messageDelete", async (message) => {
    if (!message.guild || message.author?.bot) return;
    const channel = getLogChannel(message.guild.id, 'message');
    if (!channel) return;

    let executor = null;
    try {
        const auditLogs = await message.guild.fetchAuditLogs({ type: AuditLogEvent.MessageDelete, limit: 1 });
        const log = auditLogs.entries.first();
        if (log && log.target.id === message.author.id && log.createdTimestamp > (Date.now() - 5000)) {
            executor = log.executor;
        }
    } catch (e) { }

    const embed = new EmbedBuilder()
        .setTitle("🗑️ Mesaj Silindi")
        .setDescription(`**Kanal:** ${message.channel}\n**Mesaj Sahibi:** ${message.author}\n**Silen:** ${executor ? executor : "Bilinmiyor (Kendi silmiş olabilir)"}`)
        .addFields({ name: "İçerik", value: `\`\`\`${message.content ? message.content.slice(0, 1000) : "İçerik yok (Embed/Dosya)"}\`\`\`` })
        .setColor(Colors.Red)
        .setFooter({ text: `Mesaj ID: ${message.id}` })
        .setTimestamp();

    if (message.attachments.size > 0) {
        embed.setImage(message.attachments.first().url);
    }

    channel.send({ embeds: [embed] }).catch(() => { });
});

// Mesaj Düzenleme
client.on("messageUpdate", async (oldMessage, newMessage) => {
    // Null check ve partial mesaj kontrolü
    if (!oldMessage.guild || !oldMessage.author || !newMessage.author) return;
    if (oldMessage.author.bot || oldMessage.content === newMessage.content) return;

    const channel = getLogChannel(oldMessage.guild.id, 'message');
    if (!channel) return;

    const embed = new EmbedBuilder()
        .setTitle("✏️ Mesaj Düzenlendi")
        .setDescription(`**Kanal:** ${oldMessage.channel}\n**Mesaj Sahibi:** ${oldMessage.author} ([Mesaja Git](${newMessage.url}))`)
        .addFields(
            { name: "Eski Mesaj", value: `\`\`\`${oldMessage.content ? oldMessage.content.slice(0, 1000) : "Yok"}\`\`\`` },
            { name: "Yeni Mesaj", value: `\`\`\`${newMessage.content ? newMessage.content.slice(0, 1000) : "Yok"}\`\`\`` }
        )
        .setColor(Colors.Yellow)
        .setTimestamp()
        .setThumbnail(oldMessage.author.displayAvatarURL());

    channel.send({ embeds: [embed] }).catch(() => { });
});

// 📌 SES LOGLARI
client.on("voiceStateUpdate", async (oldState, newState) => {
    const guild = newState.guild;
    const channel = getLogChannel(guild.id, 'voice');
    if (!channel) return;

    const member = newState.member;
    let embed;

    if (!oldState.channelId && newState.channelId) {
        embed = new EmbedBuilder()
            .setTitle("🔊 Kanala Katıldı")
            .setDescription(`**Kullanıcı:** ${member}\n**Kanal:** <#${newState.channelId}>`)
            .setColor(Colors.Green)
            .setTimestamp();
    } else if (oldState.channelId && !newState.channelId) {
        embed = new EmbedBuilder()
            .setTitle("🔇 Kanaldan Ayrıldı")
            .setDescription(`**Kullanıcı:** ${member}\n**Kanal:** <#${oldState.channelId}>`)
            .setColor(Colors.Red)
            .setTimestamp();
    } else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
        embed = new EmbedBuilder()
            .setTitle("🔄 Kanal Değiştirdi")
            .setDescription(`**Kullanıcı:** ${member}\n**Eski:** <#${oldState.channelId}>\n**Yeni:** <#${newState.channelId}>`)
            .setColor(Colors.Blue)
            .setTimestamp();
    }

    // Kamera ve Yayın Durumu
    if (!oldState.streaming && newState.streaming) {
        embed = new EmbedBuilder().setTitle("🎥 Yayın Açtı").setDescription(`${member} yayın açtı.`).setColor(Colors.Purple).setTimestamp();
        channel.send({ embeds: [embed] }).catch(() => { });
    }
    if (!oldState.selfVideo && newState.selfVideo) {
        embed = new EmbedBuilder().setTitle("📹 Kamera Açtı").setDescription(`${member} kamera açtı.`).setColor(Colors.Purple).setTimestamp();
        channel.send({ embeds: [embed] }).catch(() => { });
    }

    if (embed) channel.send({ embeds: [embed] }).catch(() => { });
});

// 📌 MODERASYON LOGLARI
// Ban
client.on("guildBanAdd", async (ban) => {
    const channel = getLogChannel(ban.guild.id, 'mod');
    if (!channel) return;

    let executor = null;
    try {
        const auditLogs = await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanAdd, limit: 1 });
        const log = auditLogs.entries.first();
        if (log && log.target.id === ban.user.id) executor = log.executor;
    } catch (e) { }

    const embed = new EmbedBuilder()
        .setTitle("🔨 Kullanıcı Yasaklandı")
        .setDescription(`**Kullanıcı:** ${ban.user.tag}\n**Yetkili:** ${executor ? executor : "Bilinmiyor"}`)
        .setColor(Colors.DarkRed)
        .setThumbnail(ban.user.displayAvatarURL())
        .setTimestamp();

    channel.send({ embeds: [embed] }).catch(() => { });
});

// Unban
client.on("guildBanRemove", async (ban) => {
    const channel = getLogChannel(ban.guild.id, 'mod');
    if (!channel) return;

    let executor = null;
    try {
        const auditLogs = await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanRemove, limit: 1 });
        const log = auditLogs.entries.first();
        if (log && log.target.id === ban.user.id) executor = log.executor;
    } catch (e) { }

    const embed = new EmbedBuilder()
        .setTitle("🔓 Yasak Kaldırıldı")
        .setDescription(`**Kullanıcı:** ${ban.user.tag}\n**Yetkili:** ${executor ? executor : "Bilinmiyor"}`)
        .setColor(Colors.Green)
        .setTimestamp();

    channel.send({ embeds: [embed] }).catch(() => { });
});

// 📌 SUNUCU & ÜYE İŞLEM LOGLARI (Server Log)
// Kanal İşlemleri
client.on("channelCreate", async (channel) => {
    if (!channel.guild) return;
    const logChannel = getLogChannel(channel.guild.id, 'server');
    if (!logChannel) return;

    let executor = null;
    try {
        const auditLogs = await channel.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelCreate, limit: 1 });
        const log = auditLogs.entries.first();
        if (log && log.target.id === channel.id) executor = log.executor;
    } catch (e) { }

    const embed = new EmbedBuilder()
        .setTitle("🆕 Kanal Oluşturuldu")
        .setDescription(`**Kanal:** ${channel.name} (${channel.type})\n**Oluşturan:** ${executor ? executor : "Bilinmiyor"}`)
        .setColor(Colors.Green)
        .setTimestamp();

    logChannel.send({ embeds: [embed] }).catch(() => { });
});

client.on("channelDelete", async (channel) => {
    if (!channel.guild) return;
    const logChannel = getLogChannel(channel.guild.id, 'server');
    if (!logChannel) return;

    let executor = null;
    try {
        const auditLogs = await channel.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelDelete, limit: 1 });
        const log = auditLogs.entries.first();
        if (log && log.target.id === channel.id) executor = log.executor;
    } catch (e) { }

    const embed = new EmbedBuilder()
        .setTitle("❌ Kanal Silindi")
        .setDescription(`**Kanal:** ${channel.name}\n**Silen:** ${executor ? executor : "Bilinmiyor"}`)
        .setColor(Colors.Red)
        .setTimestamp();

    logChannel.send({ embeds: [embed] }).catch(() => { });
});

// Rol İşlemleri
client.on("roleCreate", async (role) => {
    const logChannel = getLogChannel(role.guild.id, 'server');
    if (!logChannel) return;

    let executor = null;
    try {
        const auditLogs = await role.guild.fetchAuditLogs({ type: AuditLogEvent.RoleCreate, limit: 1 });
        const log = auditLogs.entries.first();
        if (log && log.target.id === role.id) executor = log.executor;
    } catch (e) { }

    const embed = new EmbedBuilder()
        .setTitle("🆕 Rol Oluşturuldu")
        .setDescription(`**Rol:** ${role.name}\n**Oluşturan:** ${executor ? executor : "Bilinmiyor"}`)
        .setColor(Colors.Green)
        .setTimestamp();

    logChannel.send({ embeds: [embed] }).catch(() => { });
});

client.on("roleDelete", async (role) => {
    const logChannel = getLogChannel(role.guild.id, 'server');
    if (!logChannel) return;

    let executor = null;
    try {
        const auditLogs = await role.guild.fetchAuditLogs({ type: AuditLogEvent.RoleDelete, limit: 1 });
        const log = auditLogs.entries.first();
        if (log && log.target.id === role.id) executor = log.executor;
    } catch (e) { }

    const embed = new EmbedBuilder()
        .setTitle("❌ Rol Silindi")
        .setDescription(`**Rol:** ${role.name}\n**Silen:** ${executor ? executor : "Bilinmiyor"}`)
        .setColor(Colors.Red)
        .setTimestamp();

    logChannel.send({ embeds: [embed] }).catch(() => { });
});

// Üye Güncellemeleri (Rol ve İsim Değişikliği)
client.on("guildMemberUpdate", async (oldMember, newMember) => {
    const logChannel = getLogChannel(newMember.guild.id, 'server');
    if (!logChannel) return;

    // Rol Değişikliği
    if (oldMember.roles.cache.size !== newMember.roles.cache.size) {
        const oldRoles = oldMember.roles.cache;
        const newRoles = newMember.roles.cache;

        const addedRoles = newRoles.filter(r => !oldRoles.has(r.id));
        const removedRoles = oldRoles.filter(r => !newRoles.has(r.id));

        let executor = null;
        try {
            const auditLogs = await newMember.guild.fetchAuditLogs({ type: AuditLogEvent.MemberRoleUpdate, limit: 1 });
            const log = auditLogs.entries.first();
            if (log && log.target.id === newMember.id) executor = log.executor;
        } catch (e) { }

        if (addedRoles.size > 0) {
            addedRoles.forEach(role => {
                const embed = new EmbedBuilder()
                    .setTitle("🛡️ Rol Verildi")
                    .setDescription(`**Kullanıcı:** ${newMember}\n**Verilen Rol:** ${role.name}\n**Yetkili:** ${executor ? executor : "Bilinmiyor/Sistem"}`)
                    .setColor(Colors.Blue)
                    .setTimestamp();
                logChannel.send({ embeds: [embed] }).catch(() => { });
            });
        }

        if (removedRoles.size > 0) {
            removedRoles.forEach(role => {
                const embed = new EmbedBuilder()
                    .setTitle("🛡️ Rol Alındı")
                    .setDescription(`**Kullanıcı:** ${newMember}\n**Alınan Rol:** ${role.name}\n**Yetkili:** ${executor ? executor : "Bilinmiyor/Sistem"}`)
                    .setColor(Colors.Orange)
                    .setTimestamp();
                logChannel.send({ embeds: [embed] }).catch(() => { });
            });
        }
    }

    // İsim Değişikliği
    if (oldMember.nickname !== newMember.nickname) {
        const embed = new EmbedBuilder()
            .setTitle("📝 İsim Değişti")
            .setDescription(`**Kullanıcı:** ${newMember}\n**Eski:** ${oldMember.nickname || oldMember.user.username}\n**Yeni:** ${newMember.nickname || newMember.user.username}`)
            .setColor(Colors.Yellow)
            .setTimestamp();
        logChannel.send({ embeds: [embed] }).catch(() => { });
    }
});
