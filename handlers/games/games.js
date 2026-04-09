const db = require("croxydb");
const { EmbedBuilder, Colors } = require("discord.js");

const hangmanStages = [
    "```\n  +---+\n  |   |\n      |\n      |\n      |\n      |\n=========```",
    "```\n  +---+\n  |   |\n  O   |\n      |\n      |\n      |\n=========```",
    "```\n  +---+\n  |   |\n  O   |\n  |   |\n      |\n      |\n=========```",
    "```\n  +---+\n  |   |\n  O   |\n /|   |\n      |\n      |\n=========```",
    "```\n  +---+\n  |   |\n  O   |\n /|\\  |\n      |\n      |\n=========```",
    "```\n  +---+\n  |   |\n  O   |\n /|\\  |\n /    |\n      |\n=========```",
    "```\n  +---+\n  |   |\n  O   |\n /|\\  |\n / \\  |\n      |\n=========```"
];

async function handleGames(message) {
    // Counting Game
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
            return true;
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

                return true;
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
            return true;
        }
    }

    // BOM Game
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

            return true;
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
            return true;
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
            return true;
        }
    }

    // Word Chain Game
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

            return true;
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
            return true;
        } else {
            db.set(`wordChainLastWord_${message.guild.id}`, userInput);
            db.set(`wordChainLastPlayer_${message.guild.id}`, message.author.id);

            const emojis = ['✅', '👏', '👍', '✨', '🎉'];
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            await message.react(randomEmoji);
            return true;
        }
    }

    // Guess Number Game
    const guessNumberChannelId = db.get(`guessNumberChannel_${message.guild.id}`);
    if (message.channel.id === guessNumberChannelId) {
        const targetNumber = db.get(`guessNumber_${message.guild.id}`);
        const userGuess = parseInt(message.content);
        const attempts = db.get(`guessAttempts_${message.guild.id}`) || 0;

        if (!isNaN(userGuess)) {
            db.set(`guessAttempts_${message.guild.id}`, attempts + 1);

            if (userGuess === targetNumber) {
                await message.react('🎉');
                message.channel.send(`${message.author}, doğru sayıyı ${attempts + 1} denemede buldu! Doğru sayı: ${targetNumber}`);
                db.delete(`guessNumberChannel_${message.guild.id}`);
                db.delete(`guessNumber_${message.guild.id}`);
                db.delete(`guessAttempts_${message.guild.id}`);
            } else if (userGuess < targetNumber) {
                await message.react('🔼');
            } else if (userGuess > targetNumber) {
                await message.react('🔽');
            }
            return true;
        }
    }

    return false;
}

module.exports = { handleGames, hangmanStages };
