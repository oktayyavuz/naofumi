const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

exports.run = async (client, message, args) => {
    const categories = {
        "Moderasyon": {
            "Kullanıcı Yönetimi": [
                { name: "> ban", description: "\n Bir kullanıcıyı sunucudan yasaklar." },
                { name: "> kick", description: "\n Bir kullanıcıyı sunucudan atar." },
                { name: "> timeout", description: "\n Bir kullanıcıya belirli bir süreyle timeout uygular (susturur)." },
                { name: "> untimeout", description: "\n Bir kullanıcının timeout'unu (susturmasını) kaldırır." },
                { name: "> unban", description: "\n Bir kullanıcının banını (yasağını) kaldırır." },
                { name: "> snipe", description: "\n Kanalda silinen son mesajı gösterir." },
                { name: "> embed", description: "\n Mesajlarınız için özelleştirilmiş bir embed oluşturun **(yanlızca slash)**." }
            ],
            "Kanal Yönetimi": [
                { name: "> lock/kilitle", description: "\n Kanalı kilitlersin **(yanlızca prefix)**." },
                { name: "> unlock/kilit-aç", description: "\n Kanalın kilidini açarsın **(yanlızca prefix)**." },
                { name: "> kilit`", description: "\n Kanalın kilidini açıp kapatırsın **(yanlızca slash)**." },
                { name: "> nuke`", description: "\n Kanalı silip tekrar açarsın." },
                { name: "> clear/sil", description: "\n 14 güne kadar olan mesajları silersin." }
            ],
            "Çekiliş": [
                { name: "> gcr/gcreate/çekiliş", description: "\n Çekiliş başlatırsın. **(yanlızca prefix)**." },
                { name: "> ginfo/çekilisinfo", description: "\n Çekilişin durumu hakkında bilgi verir. **(yanlızca prefix)**." },
                { name: "> gmember/katılımcılar", description: "\n Çekilişe katılan kullanıcıları gösterir **(yanlızca prefix)**." },
                { name: "> reroll/greroll", description: "\n Biten çekilişi yeniden çeker **(yanlızca prefix)**." }
            ]
        },
        "Kullanıcı": {
            "Temel Komutlar": [
                { name: "> avatar", description: "\n Bir kullanıcının avatarını görüntüler." },
                { name: "> ping", description: "\n Botun gecikme süresini gösterir." },
                { name: "> aşkölçer", description: "\n Kullanıcılar arasında aşk seviyesi ölçer (Rastegele)." },
                { name: "> afk", description: "\n AFK moduna geçer ve belirttiğiniz sebebi gösterir." },
                { name: "> kullanıcıbilgi", description: "\n Kullanıcı hakkında bilgi verir." },
                { name: "> sunucubanner", description: "\n Sunucu bannerını gösterir." },
                { name: "> sunucubilgi", description: "\n Sunucu hakkında bilgi verir." },
                { name: "> sunucupp", description: "\n Sunucu profilini gösterir." },
                { name: "> yardım", description: "\n Komutlar hakkında yardım sağlar." },
                { name: "> yaz", description: "\n Yazdığınız metni yazar." },
                { name: "> ping", description: "\n Pingi gösterir." },
                { name: "> botbilgi/istatistik/botstat", description: "\n Botun istatistiklerini gösterir." },
                { name: "> statkanalları/statschannels", description: "\n Stat Kanallarını kurarsın." }


            ],
            "Okane": [
                { name: "> trivia", description: "\n Anime trivia oyununu oynarsın **(yanlızca prefix)**." },
                { name: "> bj/blackjack", description: "\n Blackjack oyununu oynarsın **(yanlızca prefix)**." },
                { name: "> daily", description: "\n Günlük ödül alırsın **(yanlızca prefix)**." },
                { name: "> okane/bal", description: "\n Kullanıcının okane (oyun parası) miktarını gösterir **(yanlızca prefix)**." },
                { name: "> rank/level", description: "\n Kullanıcının seviyesini gösterir." },
                { name: "> transfer/oktr", description: "\n Kullanıcıya okane (oyun parası) transfer edersin **(yanlızca prefix)**." }
            ],
            "Eğlence": [
                { name: "> sayısayma başlat/durdur", description: "\n Sayı sayma oyununu başlatıp durdurusun." },
                { name: "> sayıtahmin başlat/durdur", description: "\n Sayı tahmin oyununu başlatıp durdurusun." },
                { name: "> bom başlat/durdur", description: "\n Bom oyununu başlatıp durdurusun." },
                { name: "> adamasmaca başlat/durdur", description: "\n Bom oyununu başlatıp durdurusun." },
                { name: "> wordchain/kelimezinciri başlat/durdur", description: "\n Wordchain oyununu başlatıp durdurusun." },
            ]
        },
        "Sistemler": {
            "Koruma": [
                { name: "> koruma", description: "\n Koruma sistemlerini aç/kapat." },
                { name: "> wlrole/whitelistrole", description: "\n Koruma sistemlerinden muaf tutulacak rolleri yönetir." }
            ],
            "Destek": [
                { name: "> desteksistemi", description: "\n Destek sistemini açmaya veye kapatmaya yarar." },

            ]
        },
        "Sunucu": [
            { name: "> otorol", description: "\n Otorol sistemini kurarsın." },
            { name: "> otorol-kapat", description: "\n Otorol sistemini kapatırsın **(yanlızca prefix)**." },
            { name: "> hg-bb", description: "\n Hoşgeldin Bye Bye Sistemini ayarlarsın." },
            { name: "> kurulum/setup", description: "\n Sunucuda çeşitli kurulum işlemlerini gerçekleştirirsin. (Bot sahibi özel)" },
            { name: "> özelodasistemi", description: "\n **(prefix)** Özel oda sistemini açar. \n **(slash)**  Özel oda sistemini açar/kapatır." },
            { name: "> özeloda kapat", description: "\n Özel oda sistemini kapatır **(yanlızca prefix)**." }
        ]
    };

    const homepageEmbed = new EmbedBuilder()
        .setTitle('Yardım Menüsü')
        .setDescription('Lütfen bir kategori seçin:')
        .setImage('https://i.hizliresim.com/812sw38.gif')
        .setColor(0x0099FF)
        .setTimestamp();

    const homepageButtons = Object.keys(categories).map(category => 
        new ButtonBuilder()
            .setCustomId(category)
            .setLabel(category)
            .setStyle(ButtonStyle.Primary)
            .setEmoji('📂')
    );

    const homepageActionRow = new ActionRowBuilder().addComponents(homepageButtons);

    const reply = await message.reply({ 
        embeds: [homepageEmbed], 
        components: [homepageActionRow] 
    });

    const collector = reply.createMessageComponentCollector({ 
        componentType: ButtonStyle.Button, 
        time: 60000 
    });

    let currentPage = 0;
    const itemsPerPage = 10;
    let currentCategory = null;
    let isSubcategory = false;

    collector.on('collect', async (interaction) => {
        if (interaction.user.id !== message.author.id) {
            await interaction.reply({ content: "Bu menüyü sadece komutu kullanan kişi kullanabilir.", ephemeral: true });
            return;
        }

        
        if (interaction.customId === 'home') {
            await interaction.update({ 
                embeds: [homepageEmbed], 
                components: [homepageActionRow] 
            });
            currentCategory = null;
            isSubcategory = false;
        } else if (categories[interaction.customId] && !isSubcategory) {
            currentCategory = interaction.customId;
            if (Array.isArray(categories[currentCategory])) {
                const totalPages = Math.ceil(categories[currentCategory].length / itemsPerPage);
                const paginatedCommands = categories[currentCategory].slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

                const categoryEmbed = new EmbedBuilder()
                    .setTitle(currentCategory)
                    .setDescription(paginatedCommands.map(cmd => `\`${cmd.name}\`  ${cmd.description}`).join('\n') || 'Bu kategoride henüz komut bulunmuyor.')
                    .setColor(0x0099FF)
                    .setFooter({ text: `Sayfa ${currentPage + 1}/${totalPages}` })
                    .setTimestamp();

                const paginationRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('previous')
                        .setLabel('◀️')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(currentPage === 0),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('▶️')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(currentPage === totalPages - 1),
                    new ButtonBuilder()
                        .setCustomId('home')
                        .setLabel('Ana Menü')
                        .setEmoji('🏠')
                        .setStyle(ButtonStyle.Success)
                );

                await interaction.update({ 
                    embeds: [categoryEmbed], 
                    components: categories[currentCategory].length > itemsPerPage ? [paginationRow] : [paginationRow] 
                });
            } else {
                const subcategoryButtons = Object.keys(categories[currentCategory]).map(subcategory => 
                    new ButtonBuilder()
                        .setCustomId(subcategory)
                        .setLabel(subcategory)
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('📂')
                );

                const subcategoryActionRow = new ActionRowBuilder().addComponents(subcategoryButtons);

                const subcategoryEmbed = new EmbedBuilder()
                    .setTitle(`${currentCategory} - Alt Kategoriler`)
                    .setDescription('Lütfen bir alt kategori seçin:')
                    .setImage('https://i.hizliresim.com/kqyhmtq.gif')
                    .setColor(0x0099FF)
                    .setTimestamp();

                await interaction.update({ 
                    embeds: [subcategoryEmbed], 
                    components: [subcategoryActionRow] 
                });
                isSubcategory = true;
            }
        } else if (isSubcategory && categories[currentCategory][interaction.customId]) {
            const selectedSubcategory = interaction.customId;
            const subcategoryCommands = categories[currentCategory][selectedSubcategory];

            const totalPages = Math.ceil(subcategoryCommands.length / itemsPerPage);
            const paginatedCommands = subcategoryCommands.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

            const subcategoryEmbed = new EmbedBuilder()
                .setTitle(`${currentCategory} - ${selectedSubcategory}`)
                .setDescription(paginatedCommands.map(cmd => `\`${cmd.name}\`  ${cmd.description}`).join('\n') || 'Bu alt kategoride henüz komut bulunmuyor.')
                .setColor(0x0099FF)
                .setFooter({ text: `Sayfa ${currentPage + 1}/${totalPages}` })
                .setTimestamp();

            const paginationRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('previous')
                    .setLabel('◀️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage === 0),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('▶️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage === totalPages - 1),
                new ButtonBuilder()
                    .setCustomId('home')
                    .setLabel('Ana Menü')
                    .setEmoji('🏠')
                    .setStyle(ButtonStyle.Success)
            );

            await interaction.update({ 
                embeds: [subcategoryEmbed], 
                components: subcategoryCommands.length > itemsPerPage ? [paginationRow] : [paginationRow] 
            });
        } else if (interaction.customId === 'previous' || interaction.customId === 'next') {
            const selectedCommands = isSubcategory ? categories[currentCategory][interaction.message.embeds[0].title.split(' - ')[1]] : categories[currentCategory];
            const totalPages = Math.ceil(selectedCommands.length / itemsPerPage);

            if (interaction.customId === 'previous' && currentPage > 0) {
                currentPage--;
            } else if (interaction.customId === 'next' && currentPage < totalPages - 1) {
                currentPage++;
            }

            const paginatedCommands = selectedCommands.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

            const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
                .setDescription(paginatedCommands.map(cmd => `\`${cmd.name}\`  ${cmd.description}`).join('\n'))
                .setFooter({ text: `Sayfa ${currentPage + 1}/${totalPages}` });

            const updatedPaginationRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('previous')
                    .setLabel('◀️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage === 0),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('▶️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage === totalPages - 1),
                new ButtonBuilder()
                    .setCustomId('home')
                    .setLabel('Ana Menü')
                    .setEmoji('🏠')
                    .setStyle(ButtonStyle.Secondary)
            );

            await interaction.update({ 
                embeds: [updatedEmbed], 
                components: [updatedPaginationRow] 
            });
        }
    });

    collector.on('end', async () => {
        try {
            const disabledButtons = homepageButtons.map(button => ButtonBuilder.from(button).setDisabled(true));
            const disabledActionRow = new ActionRowBuilder().addComponents(disabledButtons);
            await reply.edit({ components: [disabledActionRow] });
        } catch (error) {
            if (error.code === 10008) {
            } else {
                console.error('Error editing message:', error);
            }
        }
    });
};

exports.conf = {
    aliases: ["yardim"]
};

exports.help = {
    name: "yardım"
};