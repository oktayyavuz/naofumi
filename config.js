module.exports = {
    token: process.env.TOKEN, // Discord bot tokeninizi .env dosyasından alır
    prefix: "n.", // Bot prefix'ini buraya girin
    botStatus: "Tate No Yuuusha", // Bot durumunu buraya girin
    ownerID: "1193730158042021988", // Bot sahibinin Discord ID'sini buraya girin
    logChannelId: "1240045846800896020", // Log kanalının ID'sini buraya girin
    website: "https://oktaydev.com", // Bot web sitesi URL'si (opsiyonel)
    embedColor: "#5865F2", // Varsayılan embed rengi
    embedErrorColor: "#ED4245", // Hata embedlerinin rengi
    embedSuccessColor: "#57F287", // Başarı embedlerinin rengi 
    embedWarningColor: "#FEE75C", // Uyarı embedlerinin rengi
    
    cooldownMessages: true, // Cooldown mesajlarını göster/gizle
    deleteCommands: false, // Komut mesajlarını otomatik sil
    
    defaultCoinAmount: 1000, // Yeni üyelere verilecek başlangıç coin miktarı
    dailyCoins: 500, // Günlük olarak alınabilecek coin miktarı
    
    autoModEnabled: true, // Otomatik moderasyon sistemini aktif/pasif yap
    maxWarnings: 3, // Maksimum uyarı sayısı
    
    debug: false, // Debug modunu aktif/pasif yap
    maintenance: false // Bakım modunu aktif/pasif yap
}
