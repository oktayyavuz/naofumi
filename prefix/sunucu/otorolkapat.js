const { PermissionsBitField } = require('discord.js');
const db = require('croxydb'); 

exports.run = async (client, message, args) => {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
        return message.reply('Rolleri yönetmek için izniniz yok.');
    }

    try {
        await db.delete(`otorol_${message.guild.id}`);
        await db.delete(`otorol_bot_${message.guild.id}`);

        await message.reply('Otomatik rol atama başarıyla kapatıldı.');


    } catch (error) {
        console.error('Otomatik rol kapatılırken hata oluştu:', error);
        await message.reply('Otomatik rol kapatılırken bir hata oluştu.');
    }
};

exports.conf = {
    aliases: ["otorol-kapat"] 
};

exports.help = {
    name: 'otorolkapat'
};
