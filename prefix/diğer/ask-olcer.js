const { PermissionsBitField, AttachmentBuilder, EmbedBuilder, Colors } = require('discord.js');
const axios = require('axios');
const sharp = require('sharp');

exports.run = async (client, message, args) => {
    if (message.mentions.users.size < 2) {
        return message.reply("Lütfen iki kullanıcıyı etiketleyin!");
    }

    const user1 = message.mentions.users.first();
    const user2 = message.mentions.users.at(1);
    
    const lovePercentage = Math.floor(Math.random() * 101);

    try {
        const [user1ImageBuffer, user2ImageBuffer] = await Promise.all([
            axios.get(user1.displayAvatarURL({ format: 'png', size: 512 }), { responseType: 'arraybuffer' }).then(res => res.data),
            axios.get(user2.displayAvatarURL({ format: 'png', size: 512 }), { responseType: 'arraybuffer' }).then(res => res.data)
        ]);

        const circleSvg = `<svg><circle cx="128" cy="128" r="128" /></svg>`;

        const user1Image = await sharp(user1ImageBuffer)
            .resize(256, 256)
            .composite([{ input: Buffer.from(circleSvg), blend: 'dest-in' }])
            .extend({
                top: 30,
                bottom: 30,
                left: 30,
                right: 30,
                background: { r: 219, g: 112, b: 147, alpha: 1 }
            })
            .png()
            .toBuffer();

        const user2Image = await sharp(user2ImageBuffer)
            .resize(256, 256)
            .composite([{ input: Buffer.from(circleSvg), blend: 'dest-in' }])
            .extend({
                top: 30,
                bottom: 30,
                left: 30,
                right: 30,
                background: { r: 219, g: 112, b: 147, alpha: 1 }
            })
            .png()
            .toBuffer();

        const backgroundImageURL = 'https://png.pngtree.com/thumb_back/fw800/background/20240204/pngtree-happy-valentines-day-background-red-greeting-horizontal-banner-image_15607303.png';
        const backgroundBuffer = await axios.get(backgroundImageURL, { responseType: 'arraybuffer' }).then(res => res.data);

        const darkBackground = await sharp(backgroundBuffer)
            .modulate({ brightness: 0.2 }) 
            .toBuffer();

        const barHeight = 300;
        const filledHeight = Math.floor((lovePercentage / 100) * barHeight);
        const barBackground = Buffer.from(`
        <svg width="60" height="310">
            <rect x="5" y="5" width="50" height="300" fill="rgba(0, 0, 0, 0.5)" rx="25"/>
        </svg>
        `);

        const barFrontend = Buffer.from(`
        <svg width="60" height="310">
            <rect x="5" y="5" width="50" height="300" fill="rgba(0, 0, 0, 0)" rx="25" stroke="lightgrey" stroke-width="5" />
        </svg>
        `);

        const loveBarRect = Buffer.from(`
        <svg width="50" height="${barHeight}">
            <rect x="0" y="${barHeight - filledHeight}" width="50" height="${filledHeight}" fill="red" rx="25" />
            ${lovePercentage > 80 
                ? `<text x="25" y="${barHeight / 2}" text-anchor="middle" fill="white" font-size="20px">${lovePercentage}%</text>`
                : `<text x="25" y="${barHeight - filledHeight - 10}" text-anchor="middle" fill="white" font-size="20px">${lovePercentage}%</text>`}
        </svg>
        `);

        const heartBackground = await sharp(darkBackground)
            .resize(800, 400)
            .composite([
                { input: user1Image, top: 72, left: 10 }, 
                { input: user2Image, top: 72, left: 494 },
                { input: barBackground, top: 45, left: 370 }, 
                { input: loveBarRect, top: 50, left: 375 }, 
                { input: barFrontend, top: 45, left: 370 }, 
            ])
            .png()
            .toBuffer();

        const attachment = new AttachmentBuilder(heartBackground, { name: 'love-meter.png' });

        let yorum;
        if (lovePercentage > 80) {
            yorum = "Bu çift mükemmel uyum sağlıyor!";
        } else if (lovePercentage > 50) {
            yorum = "Bu çift arasında güçlü bir bağ var.";
        } else if (lovePercentage > 30) {
            yorum = "Bu çiftin biraz daha zamana ihtiyacı var.";
        } else {
            yorum = "Bu çift arasında aşk biraz zayıf görünüyor.";
        }

        const embed = new EmbedBuilder()
            .setTitle("Aşk Ölçer Sonucu")
            .setDescription(`${user1.username} ve ${user2.username} arasındaki aşk seviyesi: ${lovePercentage}%\n\n${yorum}`)
            .setColor('#ff69b4') // Pembe bir renk
            .setImage('attachment://love-meter.png');

        return message.reply({ embeds: [embed], files: [attachment] });

    } catch (error) {
        console.error('Aşk seviyesi resmi oluşturulurken hata oluştu:', error);
        return message.reply('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
};

exports.conf = {
    aliases: ["ask-olc", "love-meter","aşkölçer","aşk","ask"]
};

exports.help = {
    name: "ask-ölç"
};
