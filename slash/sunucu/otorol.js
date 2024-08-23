const { EmbedBuilder, Colors, PermissionsBitField } = require('discord.js');
const db = require('croxydb'); 

module.exports = {
    name: "otorol",
    description: "Sunucuya yeni katılan kullanıcılara otomatik olarak rol verir.",
    options: [
        {
            name: "rol",
            description: "Otomatik olarak verilecek rol (normal kullanıcılar için).",
            type: 8,
            required: true
        },
        {
            name: "bot_rolü",
            description: "Otomatik olarak verilecek rol (bot kullanıcılar için).",
            type: 8, 
            required: false
        }
    ],
    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return interaction.reply({ content: 'Rolleri yönetmek için izniniz yok.', ephemeral: true });
        }

        const role = interaction.options.getRole('rol');
        const botRole = interaction.options.getRole('bot_rolü');

        try {
            await db.set(`otorol_${interaction.guild.id}`, role.id); 
            if (botRole) {
                await db.set(`otorol_bot_${interaction.guild.id}`, botRole.id);
            } else {
                await db.delete(`otorol_bot_${interaction.guild.id}`); 
            }

            const embed = new EmbedBuilder()
                .setColor(Colors.Green)
                .setDescription(`**Kullanıcı Rolü:** ${role}\n**Bot Rolü:** ${botRole || 'Ayarlanmadı'}`)
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });

            client.on('guildMemberAdd', async (member) => {
                if (member.guild.id !== interaction.guild.id) return;

                const roleId = member.user.bot 
                    ? await db.get(`otorol_bot_${member.guild.id}`) 
                    : await db.get(`otorol_${member.guild.id}`);

                if (roleId) {
                    const role = member.guild.roles.cache.get(roleId);
                    if (role) {
                        try {
                            await member.roles.add(role);
                        } catch (error) {
                            console.error(`Otomatik rol ${role.name} verilirken hata oluştu:`, error);
                        }
                    } else {
                        console.error("Otomatik rol bulunamadı. Rol silinmiş olabilir."); 
                    }
                }
            });

        } catch (error) {
            console.error('Otomatik rol ayarlanırken hata oluştu:', error);
            await interaction.reply({ content: 'Otomatik rol ayarlanırken bir hata oluştu.', ephemeral: true });
        }
    }
};
