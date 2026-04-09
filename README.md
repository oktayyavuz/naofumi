# 🌟 Naofumi Discord.js v14 MultiPurpose Bot 🌟

<p align="center">
  <a href="https://api.weblutions.com/discord/invite/dvCKjxHn35">
    <img src="https://api.weblutions.com/discord/invite/dvCKjxHn35" alt="Weeb.dev Discord" />
  </a>
</p>

🤖 **Slahslı ve prefixli discord botu** 🤖

[🇬🇧 Click here for the English version of this README](READMEENG.md)

---

## 📋 İçerik Tablosu

- [🔧 Gereksinimler](#gereksinimler)
- [🚀 Başlarken](#başlarken)
- [👤 Yazar](#yazar)
- [💾 Kurulum](#kurulum)
- [🚀 Tüm Özellikler](#-tüm-özellikler)
- [✨ Yeni Özellikler v1.2.0](#yeni-özellikler-v120)

---

## 🔧 Gereksinimler

- [Node.js](https://nodejs.org/en/) v21 veya üzeri
- Discord.js v14

## 🚀 Başlarken

Öncelikle yerel makinenizde gerekli tüm araçların kurulu olduğundan emin olun ve ardından bu adımlara devam edin.

---

## 🚀 Tüm Özellikler

Naofumi, sunucunuzu yönetmek ve canlandırmak için geniş bir özellik yelpazesi sunar:

### 🛡️ Moderasyon
- **Gelişmiş Ban/Kick**: Kullanıcıları yasaklayın veya atın.
- **Zaman Aşımı (Timeout)**: Süreli susturma ve kaldırma.
- **Kanal Yönetimi**: `nuke` ile kanalları sıfırlayın, `kilitle/aç` ile erişimi yönetin.
- **Mesaj Temizleme**: Kanalları hızlıca temizleme.

### ⚙️ Sistemler
- **🎫 Destek (Ticket)**: HTML transkript destekli, butonlu bilet sistemi.
- **🛡️ Koruma & Anti-Raid**: Sunucuyu saldırılara ve reklamlara karşı korur.
- **🎭 Otorol & HG-BB**: Yeni üyelere otomatik rol ve karşılama mesajları.
- **🎤 Özel Oda**: Kullanıcılara özel sesli kanal oluşturma sistemi.
- **📊 Loglama**: Mesaj silme, düzenleme ve sunucu hareketlerini takip eder.

### 💰 Ekonomi ve Eğlence
- **💴 Okane Sistemi**: Günlük ödüller, bakiye ve kullanıcılar arası transfer.
- **🎰 Casino**: Slot, Blackjack ve şans oyunları.
- **🎮 Oyunlar**: Adam Asmaca, Sayı Tahmin, Kelime Zinciri.
- **🏮 Anime Trivia**: Anime bilginizi ölçen yarışma sistemi.

### 📊 Genel ve Bilgi
- **🔍 Bilgi**: Sunucu, kullanıcı ve bot hakkında detaylı istatistikler.
- **🖼️ Görsel**: Avatar, Banner (Kullanıcı/Sunucu) görüntüleme.
- **🌡️ Hava Durumu**: Dünya genelinde anlık hava durumu bilgisi.
- **📝 Snipe**: Silinen son mesajı görüntüleme.

### 🎁 Çekiliş Sistemi
- **🎉 Giveaway**: Kolayca çekiliş başlatın, kazananları belirleyin ve yedek talihliler seçin.

---

## ✨ Yeni Özellikler v1.2.0

- **📄 Premium Bilet Transkriptleri**: Destek talepleri kapatıldığında otomatik olarak profesyonel HTML transkriptleri oluşturulur ve log kanalına gönderilir.
- **🖼️ Napi-RS Canvas Entegrasyonu**: Görüntü işleme kütüphanesi `@napi-rs/canvas` ile değiştirilerek Windows VDS ortamlarında maksimum performans ve uyumluluk sağlandı.
- **🚀 Bellek ve Performans Optimizasyonu**: Komut dosyalarındaki yinelenen olay dinleyicileri kaldırılarak bellek sızıntıları (memory leaks) tamamen giderildi.
- **🛠️ Gelişmiş Etkileşim Yönetimi**: Discord etkileşimleri (`interaction`) artık daha güvenli bir şekilde işleniyor, "Etkileşim başarısız" hataları minimize edildi.
- **🛡️ Gelişmiş Hata Yönetimi**: Moderasyon ve sistem komutlarında hata yakalama ve loglama mekanizmaları güçlendirildi.

## ✨ Özellikler v1.1.0

- **🌡️ Hava Durumu Komutu**: `/havadurumu [şehir]` ve `n.havadurumu [şehir]` ile dünya genelinde hava durumu bilgisi alabilirsiniz.
- **🎰 Slot Makinesi**: `n.slot [miktar]` komutu ile ekonomi sistemi üzerinden şansınızı test edin.
- **💰 Çalma Komutu**: `n.rob @kullanıcı` ile diğer kullanıcılardan para çalmayı deneyin.
- **🛡️ Anti-Raid Sistemi**: `/antiraid` komutu ile sunucunuzu ani saldırılardan koruyun.
- **📊 Geliştirilmiş Bot Bilgi Komutu**: `/bilgi` ve `n.bilgi` ile bot hakkında detaylı bilgilere erişin.
- **🏓 Ping Komutu**: `/ping` ve `n.ping` ile bot ve API gecikmesini ölçün.
- **⚙️ Daha Kararlı ve Optimize Edilmiş Performans**: Hata yönetimi güçlendirildi, daha az sorun yaşayacaksınız.

## 💾 Kurulum

* [💻 VDS Kurulum](#vds)

### 💻 VDS

```bash
# 📂 Repoyu klonla
git clone https://github.com/oktayyavuz/naofumi

# 📁 Dizine girin
cd naofumi/

# 📦 Gerekli paketleri yükleyin
npm install 

# ⚙️ Kişisel ayarlar
# config.js dosyasındaki gereksinimleri doldur
```

### 🛠️ Gerekli İzinler

Botunuzda, [geliştirici portalındaki](https://discord.com/developers/applications/) "OAuth2" sekmesi altında bulunabilecek "applications.commands" uygulama kapsamının etkinleştirildiğinden emin olun.

[Geliştirici portalında](https://discord.com/developers/applications/) "Bot" sekmesi altında bulunabilecek "Server_Member Intents" ve "Message Intents"nı etkinleştirin.

### ⚙️ Yapılandırma

Projeyi klonladıktan ve tüm bağımlılıkları yükledikten sonra Discord API tokeninizi 'config.token' dosyasına eklemeniz gerekir.

### 🔄 Durumu Değiştirme

`/events/ready.js` dosyasındaki `activities` değişkenlerini düzenleyerek discord botunuzun durumunu değiştirebilirsiniz. `ActivityType.Watching` kısmını değiştirerek `İzliyor`, `Oynuyor` gibi şeyler yapabilirsiniz.

### 🚀 Uygulamanın Başlatılması

```bash
node index.js
```
veya

```bash
npm run start
```
veya

```bash
# 🖥️ run.bat dosyasını çalıştırın.
```

## 👤 Yazar

[Oktay Yavuz](https://oktaydev.com/)

## 📄 Lisans

Bu proje MIT Lisansı kapsamında lisanslanmıştır - ayrıntılar için [LICENSE.md](LICENSE) dosyasına bakın.


