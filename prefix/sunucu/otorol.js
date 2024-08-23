const { EmbedBuilder, Colors, PermissionsBitField } = require('discord.js');
const db = require('croxydb'); 

exports.run = async (client, message, args) => {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
        return message.reply('Rolleri yönetmek için izniniz yok.');
    }

    if (args.length < 1 || args.length > 2) {
        return message.reply('Lütfen doğru sayıda rol belirtin. Kullanım: `!otorol <kullanıcı rolü> [bot rolü]`');
    }

    const userRole = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
    if (!userRole) {
        return message.reply('Kullanıcı rolü bulunamadı.');
    }

    let botRole = null;
    if (args.length === 2) {
        botRole = message.mentions.roles.last() || message.guild.roles.cache.get(args[1]);
        if (!botRole) {
            return message.reply('Bot rolü bulunamadı.');
        }
    }

    try {
        await db.set(`otorol_${message.guild.id}`, userRole.id); 
        if (botRole) {
            await db.set(`otorol_bot_${message.guild.id}`, botRole.id);
        } else {
            await db.delete(`otorol_bot_${message.guild.id}`); 
        }

        const embed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setTitle('Otomatik Rol Ayarlandı')
            .setDescription(`
                **Kullanıcı Rolü:** ${userRole}
                **Bot Rolü:** ${botRole || 'Ayarlanmadı'}
            `)
            .setTimestamp();
        await message.reply({ embeds: [embed] });

        client.on('guildMemberAdd', async (member) => {
            if (member.guild.id !== message.guild.id) return; 

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
        await message.reply('Otomatik rol ayarlanırken bir hata oluştu.');
    }
};

exports.conf = {
    aliases: [] 
};

exports.help = {
    name: 'otorol'
};
