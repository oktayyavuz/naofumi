const db = require("croxydb");
const { EmbedBuilder, Colors } = require("discord.js");
const { isOffensiveWordCaseInsensitive, badWords } = require("../../kufurler.js");
const ms = require('ms');

function isCapsLock(text) {
    const capsThreshold = 0.7;
    const capsCount = text.split('').filter(char => char === char.toUpperCase() && char !== char.toLowerCase()).length;
    return text.length > 5 && (capsCount / text.length) >= capsThreshold;
}

async function handleAutoMod(message) {
    try {
        const kufurWhitelistRole = db.get(`kufur_whitelist_role_${message.guild.id}`) || [];
        const capslockWhitelistRole = db.get(`capslock_whitelist_role_${message.guild.id}`) || [];
        const spamWhitelistRole = db.get(`spam_whitelist_role_${message.guild.id}`) || [];
        const linkWhitelistRole = db.get(`link_whitelist_role_${message.guild.id}`) || [];
        const fullWhitelistRole = db.get(`full_whitelist_role_${message.guild.id}`) || [];

        const isWhitelisted = (roleIds) => {
            if (!Array.isArray(roleIds)) roleIds = [roleIds];
            return roleIds.some(roleId => message.member.roles.cache.has(roleId));
        };

        const isFullyWhitelisted = isWhitelisted(fullWhitelistRole);

        // Kufur Engel
        const kufurEngel = db.get(`kufur_engel_${message.guild.id}`);
        if (kufurEngel && !isFullyWhitelisted && !isWhitelisted(kufurWhitelistRole) && badWords.some(word => isOffensiveWordCaseInsensitive(message.content))) {
            await message.delete().catch();

            let kufurWarnings = db.get(`kufurWarnings_${message.author.id}_${message.guild.id}`) || 0;
            kufurWarnings++;
            db.set(`kufurWarnings_${message.author.id}_${message.guild.id}`, kufurWarnings);

            if (kufurWarnings >= 3) {
                const member = message.member;
                if (member && member.moderatable) {
                    await member.timeout(ms('1h'), "Küfür nedeniyle timeout").catch(console.error);
                    message.channel.send({ content: `${message.author}, Küfür yasak! 1 saat boyunca susturuldunuz.` });
                } else {
                    message.channel.send({ content: `${message.author}, Küfür yasak! Ancak sizi susturma yetkim yok.` });
                }
            } else {
                message.channel.send({ content: `${message.author}, Bu sunucuda küfür yasak! Tekrarlarsanız susturulabilirsiniz.` })
                    .then(sentMessage => {
                        setTimeout(() => {
                            sentMessage.delete().catch();
                        }, 5000);
                    });
            }
            return true;
        }

        // Capslock Engel
        const capslockEngel = db.get(`capslock_engel_${message.guild.id}`);
        if (capslockEngel && !isFullyWhitelisted && !isWhitelisted(capslockWhitelistRole) && isCapsLock(message.content)) {
            await message.delete().catch();

            let capslockWarnings = db.get(`capslockWarnings_${message.author.id}_${message.guild.id}`) || 0;
            capslockWarnings++;
            db.set(`capslockWarnings_${message.author.id}_${message.guild.id}`, capslockWarnings);

            if (capslockWarnings >= 3) {
                const member = message.member;
                if (member && member.moderatable) {
                    await member.timeout(ms('1h'), "Caps lock kullanımı nedeniyle timeout").catch(console.error);
                    message.channel.send({ content: `${message.author}, Lütfen caps lock kullanmadan yazın! 1 saat boyunca susturuldunuz.` });
                } else {
                    message.channel.send({ content: `${message.author}, Lütfen caps lock kullanmadan yazın! Ancak sizi susturma yetkim yok.` });
                }
            } else {
                message.channel.send({ content: `${message.author}, Lütfen caps lock kullanmadan yazın. Tekrarlarsanız susturulabilirsiniz.` })
                    .then(sentMessage => {
                        setTimeout(() => {
                            sentMessage.delete().catch();
                        }, 5000);
                    });
            }
            return true;
        }

        // Spam Koruma
        const spamKoruma = db.get(`spam_koruma_${message.guild.id}`);
        if (spamKoruma && !isFullyWhitelisted && !isWhitelisted(spamWhitelistRole)) {
            const lastMessage = db.get(`lastMessage_${message.author.id}`);
            const now = Date.now();
            if (lastMessage && (now - lastMessage) < 600) {
                await message.delete().catch();

                let spamWarnings = db.get(`spamWarnings_${message.author.id}_${message.guild.id}`) || 0;
                spamWarnings++;
                db.set(`spamWarnings_${message.author.id}_${message.guild.id}`, spamWarnings);

                if (spamWarnings >= 3) {
                    const member = message.member;
                    if (member && member.moderatable) {
                        await member.timeout(ms('1h'), "Spam nedeniyle timeout").catch(console.error);
                        message.channel.send({ content: `${message.author}, Spam yapmayın! 1 saat boyunca susturuldunuz.` });
                    } else {
                        message.channel.send({ content: `${message.author}, Spam yapmayın! Ancak sizi susturma yetkim yok.` });
                    }
                } else {
                    message.channel.send({ content: `${message.author}, Spam yapmayın! Tekrarlarsanız susturulabilirsiniz.` })
                        .then(sentMessage => {
                            setTimeout(() => {
                                sentMessage.delete().catch();
                            }, 5000);
                        });
                }
                return true;
            }
            db.set(`lastMessage_${message.author.id}`, now);
        }

        // Link Engel
        const linkEngel = db.get(`link_engel_${message.guild.id}`);
        if (linkEngel && !isFullyWhitelisted && !isWhitelisted(linkWhitelistRole) && message.content.match(/https?:\/\/\S+|(\.com|\.org|\.gg|discord\.gg)/i)) {
            await message.delete().catch();

            let linkWarnings = db.get(`linkWarnings_${message.author.id}_${message.guild.id}`) || 0;
            linkWarnings++;
            db.set(`linkWarnings_${message.author.id}_${message.guild.id}`, linkWarnings);

            if (linkWarnings >= 1) {
                const member = message.member;
                if (member && member.moderatable) {
                    await member.timeout(ms('1h'), "Link paylaşımı nedeniyle timeout").catch(console.error);
                    message.channel.send({ content: `${message.author}, Link paylaşımı yasak! 1 saat boyunca susturuldunuz.` });
                } else {
                    message.channel.send({ content: `${message.author}, Link paylaşımı yasak! Ancak sizi susturma yetkim yok.` });
                }
            } else {
                message.channel.send({ content: `${message.author}, Bu sunucuda link paylaşımı yasak! Tekrarlarsanız susturulabilirsiniz.` })
                    .then(sentMessage => {
                        setTimeout(() => {
                            sentMessage.delete().catch();
                        }, 5000);
                    });
            }
            return true;
        }
    } catch (err) {
        console.error("AutoMod Error:", err);
    }
    return false;
}

module.exports = { handleAutoMod };
