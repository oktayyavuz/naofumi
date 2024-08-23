const { EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require("discord.js");

module.exports = {
    name: "yardım",
    description: "Komutlar hakkında yardım al.",
    options: [],
    run: async (client, interaction) => {
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
            .setColor(Colors.Blue)
            .setTimestamp();

        const homepageButtons = Object.keys(categories).map(category => 
            new ButtonBuilder()
                .setCustomId(category)
                .setLabel(category)
                .setStyle(ButtonStyle.Primary)
                .setEmoji('📂')
        );

        const homepageActionRow = new ActionRowBuilder().addComponents(homepageButtons);

        const reply = await interaction.reply({ 
            embeds: [homepageEmbed], 
            components: [homepageActionRow],
            ephemeral: false
        });

        const collector = reply.createMessageComponentCollector({ 
            componentType: ComponentType.Button, 
            time: 60000 
        });

        let currentPage = 0;
        const itemsPerPage = 10;
        let currentCategory = null;
        let isSubcategory = false;
        let subCategoryName = null; 


        collector.on('collect', async (buttonInteraction) => {
            if (buttonInteraction.user.id !== interaction.user.id) {
                await buttonInteraction.reply({ content: "Bu menüyü sadece komutu kullanan kişi kullanabilir.", ephemeral: true });
                return;
            }

            if (buttonInteraction.customId === 'home') {
                currentCategory = null;
                isSubcategory = false;
                currentPage = 0;
                await buttonInteraction.update({ 
                    embeds: [homepageEmbed], 
                    components: [homepageActionRow] 
                });
            } else if (categories[buttonInteraction.customId] && !isSubcategory) {
                currentCategory = buttonInteraction.customId;

                if (Array.isArray(categories[currentCategory])) {
                    const totalPages = Math.ceil(categories[currentCategory].length / itemsPerPage);
                    const paginatedCommands = categories[currentCategory].slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

                    const categoryEmbed = new EmbedBuilder()
                        .setTitle(currentCategory)
                        .setDescription(paginatedCommands.map(cmd => `\`${cmd.name}\`    ${cmd.description}`).join('\n') || 'Bu kategoride henüz komut bulunmuyor.')
                        .setColor(Colors.Blue)
                        .setFooter({ text: `Sayfa ${currentPage + 1}/${totalPages}` })
                        .setTimestamp();

                    const previousButton = new ButtonBuilder()
                        .setCustomId('previous')
                        .setLabel('◀️')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(currentPage === 0);

                    const nextButton = new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('▶️')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(currentPage + 1 >= totalPages);

                    const categoryActionRow = new ActionRowBuilder().addComponents(previousButton, nextButton);

                    await buttonInteraction.update({ 
                        embeds: [categoryEmbed], 
                        components: [categoryActionRow] 
                    });
                } else {
                    const subcategories = Object.keys(categories[currentCategory]);
                    const subcategoryButtons = subcategories.map(subcategory => 
                        new ButtonBuilder()
                            .setCustomId(subcategory)
                            .setLabel(subcategory)
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji('📁')
                    );

                    const backButton = new ButtonBuilder()
                        .setCustomId('home')
                        .setLabel('Ana Menü')
                        .setEmoji('🏠')
                        .setStyle(ButtonStyle.Success)

                    const subcategoryActionRow = new ActionRowBuilder().addComponents(subcategoryButtons, backButton);

                    await buttonInteraction.update({ 
                        embeds: [
                            new EmbedBuilder()
                                .setTitle(`${currentCategory} Kategorileri`)
                                .setDescription('Lütfen bir alt kategori seçin:')
                                .setImage('https://i.hizliresim.com/kqyhmtq.gif')
                                .setColor(Colors.Blue)
                                .setTimestamp()
                        ], 
                        components: [subcategoryActionRow] 
                    });
                }
            } else if (currentCategory && categories[currentCategory][buttonInteraction.customId] && !isSubcategory) {
                isSubcategory = true;
                subCategoryName = buttonInteraction.customId; 
                const totalPages = Math.ceil(categories[currentCategory][subCategoryName].length / itemsPerPage);
                const paginatedCommands = categories[currentCategory][subCategoryName].slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

                const subcategoryEmbed = new EmbedBuilder()
                    .setTitle(`${subCategoryName}`)
                    .setDescription(paginatedCommands.map(cmd => `\`${cmd.name}\`    ${cmd.description}`).join('\n') || 'Bu alt kategoride henüz komut bulunmuyor.')
                    .setColor(Colors.Blue)
                    .setFooter({ text: `Sayfa ${currentPage + 1}/${totalPages}` })
                    .setTimestamp();

                const previousButton = new ButtonBuilder()
                    .setCustomId('previous')
                    .setLabel('◀️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage === 0);

                const nextButton = new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('▶️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage + 1 >= totalPages);

                const backButton = new ButtonBuilder()
                    .setCustomId('home')
                    .setLabel('Ana Menü')
                    .setEmoji('🏠')
                    .setStyle(ButtonStyle.Success)


                const subcategoryActionRow = new ActionRowBuilder().addComponents( previousButton, nextButton,backButton);

                await buttonInteraction.update({ 
                    embeds: [subcategoryEmbed], 
                    components: [subcategoryActionRow] 
                });
            } else if (buttonInteraction.customId === 'previous') {
                currentPage--;
            } else if (buttonInteraction.customId === 'next') {
                currentPage++;
            }

            if (['previous', 'next'].includes(buttonInteraction.customId)) {
                let paginatedCommands;
                let embedTitle;

                if (isSubcategory && currentCategory && subCategoryName) {
                    paginatedCommands = categories[currentCategory][subCategoryName].slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);
                    embedTitle = `${subCategoryName}`;
                } else {
                    paginatedCommands = categories[currentCategory].slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);
                    embedTitle = currentCategory;
                }

                const totalPages = Math.ceil(paginatedCommands.length / itemsPerPage);

                const updatedEmbed = new EmbedBuilder()
                    .setTitle(embedTitle)
                    .setDescription(paginatedCommands.map(cmd => `\`${cmd.name}\`    ${cmd.description}`).join('\n'))
                    .setColor(Colors.Blue)
                    .setFooter({ text: `Sayfa ${currentPage + 1}/${totalPages}` })
                    .setTimestamp();

                const previousButton = new ButtonBuilder()
                    .setCustomId('previous')
                    .setLabel('◀️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage === 0);

                const nextButton = new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('▶️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage + 1 >= totalPages);

                const backButton = new ButtonBuilder()
                    .setCustomId('home')
                    .setLabel('Ana Menü')
                    .setEmoji('🏠')
                    .setStyle(ButtonStyle.Success)


                const updatedActionRow = new ActionRowBuilder().addComponents(previousButton, nextButton,backButton);

                await buttonInteraction.update({ 
                    embeds: [updatedEmbed], 
                    components: [updatedActionRow] 
                });
            }
        });

        collector.on('end', async () => {
            await interaction.editReply({ 
                components: [] 
            });
        });
    }
};
