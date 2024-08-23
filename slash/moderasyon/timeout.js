const { EmbedBuilder, Colors, PermissionsBitField } = require("discord.js");

module.exports = {
    name: "timeout",
    description: "Bir kullanıcıya belirli bir süreyle timeout uygular (susturur).",
    options: [
        {
            name: "kullanıcı",
            description: "Timeout uygulanacak kullanıcı.",
            type: 6,
            required: true
        },
        {
            name: "süre",
            description: "Timeout süresi (ör. 1h, 30m, 1d).",
            type: 3, 
            required: true
        },
        {
            name: "sebep",
            description: "Timeout sebebi.",
            type: 3, 
            required: false
        }
    ],
    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return interaction.reply({ content: "Üyelere timeout uygulamak için izniniz yok.", ephemeral: true });
        }

        const targetUser = interaction.options.getUser("kullanıcı");
        const targetMember = await interaction.guild.members.fetch(targetUser.id); 

        if (targetMember.roles.highest.position >= interaction.member.roles.highest.position) {
            return interaction.reply({ content: "Kendinizden yüksek veya eşit role sahip bir üyeye timeout uygulayamazsınız.", ephemeral: true });
        }

        const durationMs = parseDuration(interaction.options.getString("süre")); 
        if (!durationMs) {
            return interaction.reply({ content: "Lütfen geçerli bir süre belirtin (ör. 1h, 30m, 1d).", ephemeral: true });
        }

        const reason = interaction.options.getString("sebep") || "Sebep belirtilmedi.";

        try {
            await targetMember.timeout(durationMs, reason);
            const embed = new EmbedBuilder()
                .setColor(Colors.Yellow)
                .setDescription(`**${targetUser.tag} ${durationMs / 1000 / 60} dakika süreyle timeout'a alındı.**\nSebep: ${reason}`)
                .setImage('https://i.hizliresim.com/oekcos5.gif')
                .setTimestamp();
            return interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error("Üyeye timeout uygulanırken hata oluştu:", error);
            return interaction.reply({ content: "Üyeye timeout uygulanmaya çalışılırken bir hata oluştu.", ephemeral: true });
        }
    },
};

function parseDuration(durationString) {
    const match = durationString.match(/^(\d+)([hmsd])$/);
    if (!match) return null;

    const amount = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
        case 'h': return amount * 60 * 60 * 1000; 
        case 'm': return amount * 60 * 1000; 
        case 's': return amount * 1000; 
        case 'd': return amount * 24 * 60 * 60 * 1000; 
        default: return null;
    }
}