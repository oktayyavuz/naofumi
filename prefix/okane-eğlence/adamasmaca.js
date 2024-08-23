const { EmbedBuilder, Colors, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('croxydb');

const hangmanStages = [
    "```\n  +---+\n  |   |\n      |\n      |\n      |\n      |\n=========```",
    "```\n  +---+\n  |   |\n  O   |\n      |\n      |\n      |\n=========```",
    "```\n  +---+\n  |   |\n  O   |\n  |   |\n      |\n      |\n=========```",
    "```\n  +---+\n  |   |\n  O   |\n /|   |\n      |\n      |\n=========```",
    "```\n  +---+\n  |   |\n  O   |\n /|\\  |\n      |\n      |\n=========```",
    "```\n  +---+\n  |   |\n  O   |\n /|\\  |\n /    |\n      |\n=========```",
    "```\n  +---+\n  |   |\n  O   |\n /|\\  |\n / \\  |\n      |\n=========```"
];

exports.run = async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return message.reply('Bu komutu kullanmak için yönetici yetkisine sahip olmalısınız.');
    }

    const subCommand = args[0]?.toLowerCase();
    const targetChannel = message.mentions.channels.first() || message.channel;

    if (!subCommand || !["başlat", "baslat", "start", "durdur", "stop"].includes(subCommand)) {
        return message.reply("Lütfen geçerli bir alt komut kullanın: `başlat` veya `durdur`");
    }

    try {
        if (["başlat", "baslat", "start"].includes(subCommand)) {
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
                .setFooter({ text: 'Bir harf veya kelime tahmin etmek için tahmininizi yazın.' });
            
            await message.channel.send({ embeds: [startEmbed] });
        } else if (["durdur", "stop"].includes(subCommand)) {
            await db.delete(`adamasmaca_${targetChannel.id}`);

            const stopEmbed = new EmbedBuilder()
                .setColor(Colors.Red)
                .setTitle('🛑 Adam Asmaca Oyunu Durduruldu')
                .setDescription(`${targetChannel} kanalındaki adam asmaca oyunu durduruldu.`);

            await message.channel.send({ embeds: [stopEmbed] });
        }
    } catch (error) {
        console.error("Hata oluştu:", error);
        message.reply("Bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
    }
};

exports.conf = {
    aliases: ["adamasmacaoyunu"]
};

exports.help = {
    name: "adamasmaca"
};
