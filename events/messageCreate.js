const { EmbedBuilder, Colors,ActionRowBuilder ,ButtonBuilder, ButtonStyle} = require("discord.js");
const db = require("croxydb");
const config = require("../config.js");
const client = require("../index.js");
const { isOffensiveWordCaseInsensitive,badWords } = require("../kufurler.js"); 
const ms = require('ms'); 

const hangmanStages = [
  "```\n  +---+\n  |   |\n      |\n      |\n      |\n      |\n=========```",
  "```\n  +---+\n  |   |\n  O   |\n      |\n      |\n      |\n=========```",
  "```\n  +---+\n  |   |\n  O   |\n  |   |\n      |\n      |\n=========```",
  "```\n  +---+\n  |   |\n  O   |\n /|   |\n      |\n      |\n=========```",
  "```\n  +---+\n  |   |\n  O   |\n /|\\  |\n      |\n      |\n=========```",
  "```\n  +---+\n  |   |\n  O   |\n /|\\  |\n /    |\n      |\n=========```",
  "```\n  +---+\n  |   |\n  O   |\n /|\\  |\n / \\  |\n      |\n=========```"
];

function calculateXpNeeded(level) {
  return 50 * level;
}

function calculateLevelReward(level) {
  return 10000 + (level - 1) * 1000;
}

function isCapsLock(text) {
  const capsThreshold = 0.7;
  const capsCount = text.split('').filter(char => char === char.toUpperCase() && char !== char.toLowerCase()).length;
  return (capsCount / text.length) >= capsThreshold;
}
client.on("messageCreate", async (message) => {
  if (!message.guild) return;
  if (message.author.bot) return;
  if (message.system) return;

  const countingChannelId = db.get(`countingChannel_${message.guild.id}`);
if (message.channel.id === countingChannelId) {
    const currentCount = db.get(`currentCount_${message.guild.id}`) || 0;
    const lastCounter = db.get(`lastCounter_${message.guild.id}`);
    const expectedNumber = currentCount + 1;
    const userNumber = parseInt(message.content);

    if (!isNaN(userNumber) && userNumber === expectedNumber && message.author.id !== lastCounter) {
        db.set(`currentCount_${message.guild.id}`, userNumber);
        db.set(`lastCounter_${message.guild.id}`, message.author.id);

        const emojis = ['🎉', '🎊', '🥳', '🔢', '💯'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        await message.react(randomEmoji);

        if (userNumber % 100 === 0) {
            const milestone = new EmbedBuilder()
                .setColor(Colors.Green)
                .setTitle(`${randomEmoji} Tebrikler! ${randomEmoji}`)
                .setDescription(`${message.author} ${userNumber} sayısına ulaştı!`)
                .setFooter({ text: 'Sayı sayma oyunu devam ediyor...' });

            message.channel.send({ embeds: [milestone] });
        }
    } else if (!isNaN(userNumber)) {
        if (message.author.id === lastCounter) {
            const sameUserEmbed = new EmbedBuilder()
                .setColor(Colors.Orange)
                .setTitle('⏳ Bekleyin!')
                .setDescription(`${message.author}, henüz sizin sıranız değil! Lütfen diğer oyuncuların sayı girmesini bekleyin.`)

            const sentMessage = await message.channel.send({ embeds: [sameUserEmbed] });
            await message.delete().catch(console.error); 
            setTimeout(async () => {
                await sentMessage.delete().catch(console.error); 
            }, 5000); 

            return; 
        }

        const wrongNumberEmbed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setTitle('❌ Hata!')
            .setDescription(`
                ${message.author}, yanlış sayı veya sıra! 

                Beklenen sayı: **${expectedNumber}**
                Son sayıyı yazan: <@${lastCounter}>
            `)
            .setFooter({ text: 'Sayı sayma oyunu devam ediyor.' });

        await message.channel.send({ embeds: [wrongNumberEmbed] });
    }
}
  
  const bomChannelId = db.get(`bomChannel_${message.guild.id}`);
  if (message.channel.id === bomChannelId) {
      const currentNumber = db.get(`bomNumber_${message.guild.id}`) || 0;
      const lastPlayer = db.get(`lastBomPlayer_${message.guild.id}`);
      const bomInterval = db.get(`bomInterval_${message.guild.id}`) || 7;
      const expectedNumber = currentNumber + 1;
      const userInput = message.content.toLowerCase();

      if (message.author.id === lastPlayer) {
          const sameUserEmbed = new EmbedBuilder()
              .setColor(Colors.Orange)
              .setTitle('⏳ Bekleyin!')
              .setDescription(`${message.author}, henüz sizin sıranız değil! Lütfen diğer oyuncuların sayı girmesini veya "bom" demesini bekleyin.`)

          const sentMessage = await message.channel.send({ embeds: [sameUserEmbed] });
          await message.delete().catch(console.error); 
          setTimeout(async () => {
              await sentMessage.delete().catch(console.error);
          }, 5000); 

          return; 
      }

      if (expectedNumber % bomInterval === 0) {
          if (userInput === 'bom') {
              db.set(`bomNumber_${message.guild.id}`, expectedNumber);
              db.set(`lastBomPlayer_${message.guild.id}`, message.author.id);

              const correctBom = new EmbedBuilder()
                  .setColor(Colors.Green)
                  .setTitle('🎉 Doğru!')
                  .setDescription(`${message.author} doğru bir şekilde BOM dedi!`)
                  .setFooter({ text: `Sıradaki sayı: ${expectedNumber + 1}` });

              await message.channel.send({ embeds: [correctBom] });
              await message.react('💥');
          } else {
              const wrongBom = new EmbedBuilder()
                  .setColor(Colors.Red)
                  .setTitle('❌ Yanlış!')
                  .setDescription(`${message.author}, BOM demeliydin! Oyun yeniden başlıyor.`)
                  .setFooter({ text: 'Bom oyunu sıfırlandı.' });

              await message.channel.send({ embeds: [wrongBom] });
              db.set(`bomNumber_${message.guild.id}`, 0);
              db.delete(`lastBomPlayer_${message.guild.id}`);
          }
      } else {
          if (userInput === expectedNumber.toString()) {
              db.set(`bomNumber_${message.guild.id}`, expectedNumber);
              db.set(`lastBomPlayer_${message.guild.id}`, message.author.id);

              const emojis = ['🔢', '🎭', '🎲', '🃏', '🎱'];
              const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
              await message.react(randomEmoji);
          } else {
              const wrongNumber = new EmbedBuilder()
                  .setColor(Colors.Red)
                  .setTitle('❌ Hata!')
                  .setDescription(`${message.author}, yanlış sayı! Beklenen sayı ${expectedNumber} idi. Oyun yeniden başlıyor.`)
                  .setFooter({ text: 'Bom oyunu sıfırlandı.' });

              await message.channel.send({ embeds: [wrongNumber] });
              db.set(`bomNumber_${message.guild.id}`, 1);
              db.delete(`lastBomPlayer_${message.guild.id}`);
          }
      }
  }
  const wordChainChannelId = db.get(`wordChainChannel_${message.guild.id}`);
  if (message.channel.id === wordChainChannelId) {
      const lastWord = db.get(`wordChainLastWord_${message.guild.id}`) || '';
      const lastPlayer = db.get(`wordChainLastPlayer_${message.guild.id}`);
      const userInput = message.content.toLowerCase();
  
      if (message.author.id === lastPlayer) {
          const sameUserEmbed = new EmbedBuilder()
              .setColor(Colors.Orange)
              .setTitle('⏳ Bekleyin!')
              .setDescription(`${message.author}, henüz sizin sıranız değil! Lütfen diğer oyuncuların kelime girmesini bekleyin.`);
  
          const sentMessage = await message.channel.send({ embeds: [sameUserEmbed] });
          await message.delete().catch(console.error); 
          setTimeout(async () => {
              await sentMessage.delete().catch(console.error);
          }, 5000); 
  
          return; 
      }
  
      if (lastWord && !userInput.startsWith(lastWord.slice(-1))) {
          const wrongWordEmbed = new EmbedBuilder()
              .setColor(Colors.Red)
              .setTitle('❌ Yanlış Kelime!')
              .setDescription(`${message.author}, kelimeniz yanlış! Doğru kelime "${lastWord.slice(-1)}" harfiyle başlamalıydı. Oyun yeniden başlıyor.`)
              .setFooter({ text: 'Kelime zinciri oyunu sıfırlandı.' });
  
          await message.channel.send({ embeds: [wrongWordEmbed] });
          db.delete(`wordChainLastWord_${message.guild.id}`);
          db.delete(`wordChainLastPlayer_${message.guild.id}`);
      } else {
          db.set(`wordChainLastWord_${message.guild.id}`, userInput);
          db.set(`wordChainLastPlayer_${message.guild.id}`, message.author.id);
  
          const emojis = ['✅', '👏', '👍', '✨', '🎉']; 
          const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
          await message.react(randomEmoji);
      }
  }

  const guessNumberChannelId = db.get(`guessNumberChannel_${message.guild.id}`);
  if (message.channel.id === guessNumberChannelId) {
      const targetNumber = db.get(`guessNumber_${message.guild.id}`);
      const userGuess = parseInt(message.content);
      const attempts = db.get(`guessAttempts_${message.guild.id}`) || 0;
  
      if (!isNaN(userGuess)) {
          db.set(`guessAttempts_${message.guild.id}`, attempts + 1);
  
          if (userGuess === targetNumber) {
              await message.react('🎉'); // Doğru tahmin için emoji tepkisi
              message.channel.send(`${message.author}, doğru sayıyı ${attempts + 1} denemede buldu! Doğru sayı: ${targetNumber}`);
              db.delete(`guessNumberChannel_${message.guild.id}`);
              db.delete(`guessNumber_${message.guild.id}`);
              db.delete(`guessAttempts_${message.guild.id}`);
          } else if (userGuess < targetNumber) {
              await message.react('🔼'); // Daha yüksek bir sayı tahmin edin tepkisi
          } else if (userGuess > targetNumber) {
              await message.react('🔽'); // Daha düşük bir sayı tahmin edin tepkisi
          }
      }
  }
  const adamasmacaData = db.get(`adamasmaca_${message.channel.id}`);
  if (adamasmacaData) {
      const guess = message.content.toLowerCase();

      if (guess.length > 1) {
          if (guess === adamasmacaData.word.toLowerCase()) {
              await db.delete(`adamasmaca_${message.channel.id}`);

              const row = new ActionRowBuilder()
                  .addComponents(
                      new ButtonBuilder()
                          .setCustomId('restartHangman')
                          .setLabel('Oyunu Yeniden Başlat')
                          .setStyle(ButtonStyle.Success),
                  );

              const winEmbed = new EmbedBuilder()
                  .setColor(Colors.Green)
                  .setTitle('🎉 Tebrikler, Kazandınız!')
                  .setDescription(`
                      ${hangmanStages[adamasmacaData.attempts]}
                      Kelime: **${adamasmacaData.word}**
                  `);

              return message.channel.send({ embeds: [winEmbed], components: [row] });
          } else {
              adamasmacaData.attempts++;

              if (adamasmacaData.attempts >= 6) {
                  await db.delete(`adamasmaca_${message.channel.id}`);

                  const row = new ActionRowBuilder()
                      .addComponents(
                          new ButtonBuilder()
                              .setCustomId('restartHangman')
                              .setLabel('Oyunu Yeniden Başlat')
                              .setStyle(ButtonStyle.Danger),
                      );

                  const loseEmbed = new EmbedBuilder()
                      .setColor(Colors.Red)
                      .setTitle('❌ Kaybettiniz!')
                      .setDescription(`
                          ${hangmanStages[adamasmacaData.attempts]}
                          Kelime: **${adamasmacaData.word}**
                      `);
                  return message.channel.send({ embeds: [loseEmbed], components: [row] });
              } else {
                  const embed = new EmbedBuilder()
                      .setColor(Colors.Red)
                      .setTitle('❌ Yanlış Tahmin!')
                      .setDescription(`
                          ${hangmanStages[adamasmacaData.attempts]} 
                          Kelime: ${adamasmacaData.hiddenWord}
                          Kalan Hak: ${6 - adamasmacaData.attempts}
                          Kullanılan Harfler: ${adamasmacaData.usedLetters.join(', ')}
                      `);
                  await db.set(`adamasmaca_${message.channel.id}`, adamasmacaData);
                  return message.channel.send({ embeds: [embed] });
              }
          }
      }

      if (guess.length === 1 && /[a-zA-ZğüşöçİĞÜŞÖÇ]/.test(guess)) {
          if (adamasmacaData.usedLetters.includes(guess)) {
              return message.reply('Bu harf zaten kullanıldı!');
          }

          adamasmacaData.usedLetters.push(guess);

          if (adamasmacaData.word.toLowerCase().includes(guess)) {
              let updatedHiddenWord = adamasmacaData.hiddenWord.split('');

              for (let i = 0; i < adamasmacaData.word.length; i++) {
                  if (adamasmacaData.word[i].toLowerCase() === guess) {
                      updatedHiddenWord[i] = adamasmacaData.word[i];
                  }
              }

              adamasmacaData.hiddenWord = updatedHiddenWord.join('');

              if (adamasmacaData.hiddenWord === adamasmacaData.word) {
                  await db.delete(`adamasmaca_${message.channel.id}`);

                  const row = new ActionRowBuilder()
                      .addComponents(
                          new ButtonBuilder()
                              .setCustomId('restartHangman')
                              .setLabel('Oyunu Yeniden Başlat')
                              .setStyle(ButtonStyle.Success),
                      );

                  const winEmbed = new EmbedBuilder()
                      .setColor(Colors.Green)
                      .setTitle('🎉 Tebrikler, Kazandınız!')
                      .setDescription(`
                          ${hangmanStages[adamasmacaData.attempts]}
                          Kelime: **${adamasmacaData.word}**
                      `);

                  return message.channel.send({ embeds: [winEmbed], components: [row] });
              } else {
                  const embed = new EmbedBuilder()
                      .setColor(Colors.Green)
                      .setTitle('✅ Doğru Tahmin!')
                      .setDescription(`
                          ${hangmanStages[adamasmacaData.attempts]} 
                          Kelime: ${adamasmacaData.hiddenWord}
                          Kalan Hak: ${6 - adamasmacaData.attempts}
                          Kullanılan Harfler: ${adamasmacaData.usedLetters.join(', ')}
                      `);
                  await db.set(`adamasmaca_${message.channel.id}`, adamasmacaData);
                  return message.channel.send({ embeds: [embed] });
              }
          } else {
              adamasmacaData.attempts++;

              if (adamasmacaData.attempts >= 6) {
                  await db.delete(`adamasmaca_${message.channel.id}`);

                  const row = new ActionRowBuilder()
                      .addComponents(
                          new ButtonBuilder()
                              .setCustomId('restartHangman')
                              .setLabel('Oyunu Yeniden Başlat')
                              .setStyle(ButtonStyle.Danger),
                      );

                  const loseEmbed = new EmbedBuilder()
                      .setColor(Colors.Red)
                      .setTitle('❌ Kaybettiniz!')
                      .setDescription(`
                          ${hangmanStages[adamasmacaData.attempts]}
                          Kelime: **${adamasmacaData.word}**
                      `);
                  return message.channel.send({ embeds: [loseEmbed], components: [row] });
              } else {
                  const embed = new EmbedBuilder()
                      .setColor(Colors.Red)
                      .setTitle('❌ Yanlış Tahmin!')
                      .setDescription(`
                          ${hangmanStages[adamasmacaData.attempts]} 
                          Kelime: ${adamasmacaData.hiddenWord}
                          Kalan Hak: ${6 - adamasmacaData.attempts}
                          Kullanılan Harfler: ${adamasmacaData.usedLetters.join(', ')}
                      `);
                  await db.set(`adamasmaca_${message.channel.id}`, adamasmacaData);
                  return message.channel.send({ embeds: [embed] });
              }
          }
      }
  }

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
    }


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
    }


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
            return;
        }
        db.set(`lastMessage_${message.author.id}`, now);
    }

    const linkEngel = db.get(`link_engel_${message.guild.id}`);
    if (
        linkEngel && 
        !isFullyWhitelisted && 
        !isWhitelisted(linkWhitelistRole) && 
        message.content.match(/https?:\/\/\S+|(\.com|\.org|\.gg|discord\.gg)/i)
    ) {
        await message.delete().catch();

        let linkWarnings = db.get(`linkWarnings_${message.author.id}_${message.guild.id}`) || 0;
        linkWarnings++;
        db.set(`linkWarnings_${message.author.id}_${message.guild.id}`, linkWarnings);

        let timeoutDuration = linkWarnings === 1 ? ms('1h') : (linkWarnings >= 3 ? ms('1h') : 0); 

        if (timeoutDuration > 0) {
            const member = message.member;
            if (member && member.moderatable) {
                await member.timeout(timeoutDuration, "Link paylaşımı nedeniyle timeout").catch(console.error);
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
    }
  } catch (err) {
  }

  const economyEnabled = db.get("economyEnabled");

  if (economyEnabled) {
    let userData = db.get(`economy_${message.author.id}`) || {
      money: 0,
      level: 1,
      xp: 0,
      lastMessageDate: null,
      firstMessageBonusReceived: false
    };

    if (!userData.firstMessageBonusReceived) {
      userData.money += 10000;
      userData.firstMessageBonusReceived = true;

      const embed = new EmbedBuilder()
        .setColor(Colors.Green)
        .setTitle("İlk Mesaj Bonusu!")
        .setDescription(`İlk mesaj bonusu olarak **10.000** okane kazandınız!`)
        .setTimestamp();

      message.reply({ embeds: [embed] });
    }

    const xpGained = 2;
    userData.xp += xpGained;

    const moneyGained = Math.floor(Math.random() * userData.level * 2) + userData.level;
    userData.money += moneyGained;

    let xpNeeded = calculateXpNeeded(userData.level);

    while (userData.xp >= xpNeeded) {
      userData.level++;
      userData.xp -= xpNeeded;
      xpNeeded = calculateXpNeeded(userData.level);

      const levelReward = calculateLevelReward(userData.level);
      userData.money += levelReward;

      const embed = new EmbedBuilder()
        .setColor(Colors.Blue)
        .setTitle("Seviye Atladınız!")
        .setDescription(`Tebrikler ${message.author}! \n Yeni seviyeniz: **${userData.level}**.\nÖdül olarak **${levelReward}** okane kazandınız!\nBir sonraki seviyeye geçmek için gereken XP: **${xpNeeded}**`)
        .setTimestamp();

      message.reply({ embeds: [embed] });
    }

    db.set(`economy_${message.author.id}`, userData);
  }

  if (!message.content.startsWith(config.prefix)) return;

  let command = message.content.toLowerCase().split(" ")[0].slice(config.prefix.length);
  let params = message.content.split(" ").slice(1);
  let cmd;
  if (client.prefixCommands.has(command)) {
    cmd = client.prefixCommands.get(command);
  } else if (client.prefixAliases.has(command)) {
    cmd = client.prefixCommands.get(client.prefixAliases.get(command));
  }
  if (cmd) {
    cmd.run(client, message, params);
  }
});


client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'restartHangman') {
    const targetChannel = interaction.channel; 

    try {
      const wordList = [
        'astronomi', 'bilgisayar', 'programlama', 'mikroskop', 'otosansür',
        'girişimcilik', 'entegrasyon', 'iletişim', 'mühendislik', 'tarihçe',
        'tasarım', 'simülasyon', 'demokrasi', 'prosedür', 'karantina',
        'paradigma', 'sosyoloji', 'analiz', 'dinamik', 'sistem',
        'biyoloji', 'matematik', 'fizik', 'kimya', 'psikoloji',
        'mimarlık', 'hukuk', 'ekonomi', 'edebiyat', 'müzik',
        'sinema', 'teknoloji', 'robotik', 'otomasyon', 'veritabanı',
        'yapayzeka', 'blockchain', 'kripto', 'güneşenerjisi', 'radyasyon',
        'sosyalleşme', 'zooloji', 'entropi', 'algoritma', 'ağ',
        'tanımsız', 'reaksiyon', 'reaktör', 'molekül', 'atom',
        'renk', 'güzel', 'büyü', 'sohbet', 'dinlenme', 'eğlence', 'yaz', 'kış',
        'film', 'müzik', 'teatro', 'yarış', 'spor', 'yemek', 'tat', 'meyve',
        'sebze', 'çay', 'kahve', 'restoran', 'pazar', 'alışveriş', 'kitap',
        'roman', 'hikaye', 'masal', 'çizgi', 'şair', 'yazar', 'resim', 'fotoğraf',
        'sanatçı', 'sergi', 'heykel', 'tarih', 'kültür', 'gezi', 'tatile',
        'dünya', 'şehir', 'kasaba', 'köy', 'plaj', 'dağ', 'göl', 'nehir',
        'orman', 'bahçe', 'park', 'sokak', 'caddede', 'yürüyüş', 'koşu',
        'bisiklet', 'otobüs', 'tren', 'uçak', 'gemide', 'havaalanı', 'istasyon',
        'bilet', 'tatil', 'otelde', 'kamp', 'yatak', 'yastık', 'örtü',
        'oda', 'ev', 'aile', 'arkadaş', 'dost', 'komşu', 'bakkal',
        'market', 'çamaşır', 'temizlik', 'yemek', 'kahvaltı', 'öğle',
        'akşam', 'gece', 'film', 'kitap', 'müzik', 'dans', 'televizyon',
        'radyo', 'oyun', 'puzzle', 'bulmaca', 'şarkı', 'melodi', 'ritim',
        'serin', 'sıcak', 'yağmur', 'kar', 'rüzgar', 'güneş', 'bulut',
        'yıldız', 'ay', 'göz', 'burun', 'ağız', 'kulak', 'saç',
        'el', 'ayak', 'kıyafet', 'pantolon', 'gömlek', 'çanta', 'şapka',
        'telefon', 'bilgisayar', 'internet', 'uygulama', 'video', 'oyun',
        'dijital', 'e-posta', 'mesaj', 'web', 'site', 'blog', 'yazılım',
        'uygulama', 'sosyal', 'medya', 'fotoğraf', 'kamera', 'video',
        'film', 'dizi', 'belgesel', 'konser', 'performans', 'gösteri',
        'festival', 'etkinlik', 'katılım', 'organizatör', 'sunum',
        'toplantı', 'seminer', 'konferans', 'eğitim', 'kurs', 'ödev',
        'sınav', 'not', 'ders', 'öğretmen', 'öğrenci', 'okul',
        'üniversite', 'kütüphane', 'araştırma', 'makale', 'kitap',
        'dergi', 'gazete', 'yazar', 'editor', 'yayın', 'basım',
        'yayıncı', 'grafik', 'tasarım', 'logo', 'afiş', 'broşür',
        'posteri', 'reklam', 'kampanya', 'strateji', 'pazarlama',
        'satış', 'ürün', 'marka', 'şirket', 'işletme', 'girişim',
        'startup', 'yatırım', 'finans', 'ekonomi', 'bütçe', 'planlama',
        'vergi', 'gelir', 'gider', 'kâr', 'zarar', 'bilanço',
        'karar', 'strateji', 'hedef', 'proje', 'yönetim', 'liderlik',
        'ekip', 'işbirliği', 'topluluk', 'ağ', 'bağlantı', 'ilişki',
        'etkileşim', 'paylaşım', 'işlem', 'alışveriş', 'ödeme',
        'sistem', 'şifre', 'güvenlik', 'şifre', 'kullanıcı', 'profil'
      ];

      const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
      const hiddenWord = '• '.repeat(randomWord.length);

      await db.set(`adamasmaca_${targetChannel.id}`, {
        word: randomWord,
        hiddenWord: hiddenWord,
        attempts: 0,
        usedLetters: []
      });

      const startEmbed = new EmbedBuilder()
        .setColor(Colors.Blue)
        .setTitle('🎭 Adam Asmaca Oyunu Başladı!')
        .setDescription(`
          ${targetChannel} kanalında adam asmaca oyunu başladı!

          ${hangmanStages[0]} 

          Kelime: ${hiddenWord} 
          Kalan Hak: 6
          Kullanılan Harfler: Yok
        `)
        .setFooter({ text: 'Bir harf tahmin etmek için tek harf yazın komutunu kullanın.' });


      await interaction.update({ embeds: [startEmbed], components: [] }); 
    } catch (error) {
      console.error("Hata oluştu:", error);
      await interaction.reply({ content: "Bir hata oluştu. Lütfen daha sonra tekrar deneyin.", ephemeral: true });
    }
  }
});