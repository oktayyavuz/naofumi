const client = require("../index");
const { Collection, ActivityType ,EmbedBuilder } = require("discord.js")
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const fs = require("fs")
const path = require("path");
const config = require("../config.js");
const db = require('croxydb'); 

client.on("ready", () => {


    client.prefixCommands = new Collection();
    client.prefixAliases = new Collection();
    client.slashCommands = new Collection();
    const slashCommandsLoader = []


    const prefixCommandFolders = fs.readdirSync('./prefix');
    for (const folder of prefixCommandFolders) {
        const folderPath = path.join('./prefix', folder);
        const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(folderPath, file);
            const props = require("../" + filePath);

            console.log(`[⁉] | ${props.help.name}/${folder}  Komut Yüklendi!`)
            client.prefixCommands.set(props.help.name, props);

            props.conf.aliases.forEach(alias => {
                client.prefixAliases.set(alias, props.help.name);
            });
        }
    }


    const slashCommandFolders = fs.readdirSync('./slash');
    for (const folder of slashCommandFolders) {
        const folderPath = path.join('./slash', folder);
        const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(folderPath, file);
            const props = require("../" + filePath);

            client.slashCommands.set(props.name, props);
            slashCommandsLoader.push({
                name: props.name,
                description: props.description,
                options: props.options
                });
            console.log(`[/] | ${props.name}/${folder} Komut Yüklendi!`)

        }
    }


    const rest = new REST({ version: "10" }).setToken(config.token);
    (async () => {
        try {
            await rest.put(Routes.applicationCommands(client.user.id), {
                body: await slashCommandsLoader,
            });
            console.log("Uygulama [/] komutları başarıyla yüklendi. ✔ ");
        } catch (e) {
            console.log("Uygulama [/] komutları yüklenemedi." + e);
        }
    })();
    console.log(`
    
──────────────────────────────────────────
💕 | ${client.user.tag} Çevrimiçi! | WeebDev tarafından geliştirildi
──────────────────────────────────────────

`);
    
        client.user.setPresence({
            status: 'dnd', 
            activities: [{
                name: config.botStatus, 
                type: ActivityType.Watching 
            }],
        });
    
        process.title = config.botStatus;
    
        setTimeout(() => {
            try {
                checkActiveGiveaways(client);
                console.log('Aktif çekilişler kontrol edildi ve yeniden başlatıldı.');
            } catch (error) {
                console.error('Aktif çekilişler kontrol edilirken hata oluştu:', error);
            }
        }, 1000);
    });




async function checkActiveGiveaways(client) {
    console.log('Aktif çekilişler kontrol ediliyor...');
    const allGiveaways = await db.all();

    console.log(`Toplam çekiliş sayısı: ${Object.keys(allGiveaways).length}`);

    for (const [key, value] of Object.entries(allGiveaways)) {
        if (key.startsWith('giveaway_') && !value.ended) {
            const giveawayId = key.split('_')[1];
            const elapsedTime = Date.now() - value.startTime;
            const remainingTime = value.duration - elapsedTime;

            const channel = await client.channels.fetch(value.channelId).catch(() => null); 
            if (!channel) {
                console.log(`Çekiliş ${giveawayId} artık mevcut olmayan bir kanalda, veriler siliniyor...`);
                await db.delete(`giveaway_${giveawayId}`);
                continue;
            }

            if (remainingTime > 0) {
                console.log(`Çekiliş ${giveawayId} devam ediyor, geri sayım başlatılıyor...`);
                countdownGiveaway(client, giveawayId);
            } else {
                console.log(`Çekiliş ${giveawayId} süresi doldu, bitiriliyor...`);
                await endGiveaway(client, giveawayId);
            }
        }
    }
}

async function endGiveaway(client, giveawayId) {
    const giveawayData = await db.get(`giveaway_${giveawayId}`);
    if (!giveawayData || giveawayData.ended) return;

    const channel = await client.channels.fetch(giveawayData.channelId);
    if (!channel) return;

    let endEmbed;
    if (giveawayData.participants.length === 0) {
        endEmbed = new EmbedBuilder()
            .setTitle('Çekiliş Bitti!')
            .setDescription(`Ödül: ${giveawayData.prize}\nBu çekilişte hiç katılımcı yok.`)
            .setColor('#FF0000')
            .setThumbnail('https://i.hizliresim.com/9sgzpr0.png')
            .setTimestamp();

        await channel.send({ embeds: [endEmbed] });
    } else {
        const winnerId = giveawayData.participants[Math.floor(Math.random() * giveawayData.participants.length)];
        let winnerUser;
        try {
            winnerUser = await client.users.fetch(winnerId);
        } catch (error) {
            console.error('Kazanan kullanıcı bulunamadı:', error);
        }

        if (!winnerUser) {
            endEmbed = new EmbedBuilder()
                .setTitle('Çekiliş Bitti!')
                .setDescription(`Ödül: ${giveawayData.prize}\nBu çekilişte kazanan çıkmadı.`)
                .setColor('#FF0000')
                .setThumbnail('https://i.hizliresim.com/9sgzpr0.png')
                .setTimestamp();

            await channel.send({ embeds: [endEmbed] });
        } else {
            endEmbed = new EmbedBuilder()
                .setTitle('Çekiliş Bitti!')
                .setDescription(`Ödül: ${giveawayData.prize}\nKazanan: ${winnerUser.tag}`)
                .setColor('#FF0000')
                .setThumbnail('https://i.hizliresim.com/9sgzpr0.png')
                .setTimestamp();

            await channel.send(`🎉 Tebrikler <@${winnerUser.id}>! Sen kazandın! 🎉`);
            await channel.send({ embeds: [endEmbed] });
        }
    }

    giveawayData.ended = true;
    await db.set(`giveaway_${giveawayId}`, giveawayData);
}


async function updateGiveawayMessage(client, giveawayId, remainingTime) {
    const giveawayData = await db.get(`giveaway_${giveawayId}`);
    if (!giveawayData) return;

    const channel = await client.channels.fetch(giveawayData.channelId);
    if (!channel) return;

    let messageUpdated = false;
    let retryCount = 0;
    const maxRetries = 5;

    while (!messageUpdated && retryCount < maxRetries) {
        try {
            const message = await channel.messages.fetch(giveawayData.messageId);
            
            const updatedEmbed = new EmbedBuilder()
                .setTitle('🎉 Çekiliş Devam Ediyor! 🎉')
                .setDescription(`Ödül: ${giveawayData.prize}\nKatılmak veya ayrılmak için butona tıklayın!\n\nBitiş zamanı: <t:${Math.floor((Date.now() + remainingTime) / 1000)}:R>`)
                .setFooter({ text: `Çekiliş ID: ${giveawayId}` })
                .setColor('#0099ff')
                .setThumbnail('https://i.hizliresim.com/9sgzpr0.png')
                .setTimestamp(Date.now() + remainingTime);

            await message.edit({ embeds: [updatedEmbed] });
            messageUpdated = true;
        } catch (error) {
            console.error(`Çekiliş mesajı güncellenirken hata oluştu (ID: ${giveawayId}), tekrar deneniyor...`, error);
            retryCount++;
            if (retryCount >= maxRetries) {
                console.error(`Çekiliş mesajı güncellenirken ${maxRetries} kez hata alındı, denemeler durduruluyor.`);
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 5000)); 
        }
    }
}



function countdownGiveaway(client, giveawayId) {
    const interval = setInterval(async () => {
        const giveawayData = await db.get(`giveaway_${giveawayId}`);
        if (!giveawayData || giveawayData.ended) {
            console.log(`Çekiliş ${giveawayId} sonlandı veya bulunamadı.`);
            clearInterval(interval);
            return;
        }

        const elapsed = Date.now() - giveawayData.startTime;
        const remainingTime = giveawayData.duration - elapsed;


        if (remainingTime <= 0) {
            console.log(`Çekiliş ${giveawayId} süresi doldu, sonlandırılıyor...`);
            clearInterval(interval);
            await endGiveaway(client, giveawayId);
        } else {
            updateGiveawayMessage(client, giveawayId, remainingTime);
        }
    }, 5000); 
}

