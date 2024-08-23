const { EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const db = require("croxydb");

exports.run = async (client, message, args) => {
  const bet = parseInt(args[0]);
  if (!bet || isNaN(bet) || bet <= 0) {
    return message.reply("Lütfen geçerli bir bahis miktarı girin.");
  }

  const userData = db.get(`economy_${message.author.id}`);
  if (!userData || userData.money < bet) {
    return message.reply("Yeterli miktarda okane'niz yok.");
  }

  const cards = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  const suits = ["♠️", "♥️", "♣️", "♦️"];

  function drawCard() {
    const card = cards[Math.floor(Math.random() * cards.length)];
    const suit = suits[Math.floor(Math.random() * suits.length)];
    return { card, suit, value: card === "A" ? 11 : isNaN(parseInt(card)) ? 10 : parseInt(card) };
  }

  function calculateHand(hand) {
    let sum = 0;
    let aces = 0;
    hand.forEach(card => {
      sum += card.value;
      if (card.card === "A") aces++;
    });
    while (sum > 21 && aces) {
      sum -= 10;
      aces--;
    }
    return sum;
  }

  const playerHand = [drawCard(), drawCard()];
  const dealerHand = [drawCard(), drawCard()];

  let playerSum = calculateHand(playerHand);
  let dealerSum = calculateHand(dealerHand);

  const gameEmbed = new EmbedBuilder()
    .setColor(Colors.Blue)
    .setTitle("Blackjack 🃏")
    .setDescription(`Bahis miktarı: **${bet} okane**\n\n**Senin Kartların:** ${playerHand.map(c => `${c.card}${c.suit}`).join(" ")} (Toplam: ${playerSum})\n**Krupiyenin Kartları:** ${dealerHand[0].card}${dealerHand[0].suit} ?`)
    .setFooter({ text: `${message.author.username} için oyun`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });

  const hitButton = new ButtonBuilder()
    .setCustomId('hit')
    .setLabel('Kart Çek')
    .setStyle(ButtonStyle.Primary);

  const standButton = new ButtonBuilder()
    .setCustomId('stand')
    .setLabel('Dur')
    .setStyle(ButtonStyle.Danger);

  const buttons = new ActionRowBuilder().addComponents(hitButton, standButton);

  const msg = await message.reply({ embeds: [gameEmbed], components: [buttons] });

  const filter = (interaction) => interaction.user.id === message.author.id;

  const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

  collector.on('collect', async interaction => {
    if (interaction.customId === "hit") {
      playerHand.push(drawCard());
      playerSum = calculateHand(playerHand);
      if (playerSum > 21) {
        return endGame("Kaybettiniz, eliniz 21'i aştı!");
      }
    } else if (interaction.customId === "stand") {
      while (dealerSum < 17) {
        dealerHand.push(drawCard());
        dealerSum = calculateHand(dealerHand);
      }
      if (dealerSum > 21 || playerSum > dealerSum) {
        return endGame("Kazandınız!");
      } else if (playerSum < dealerSum) {
        return endGame("Kaybettiniz!");
      } else {
        return endGame("Berabere kaldınız!");
      }
    }

    gameEmbed.setDescription(`Bahis miktarı: **${bet} okane**\n\n**Senin Kartların:** ${playerHand.map(c => `${c.card}${c.suit}`).join(" ")} (Toplam: ${playerSum})\n**Krupiyenin Kartları:** ${dealerHand[0].card}${dealerHand[0].suit} ?`);

    await interaction.update({ embeds: [gameEmbed], components: [buttons] });
  });

  collector.on('end', () => {
    if (!collector.ended) endGame("Süre doldu.");
  });

  function endGame(result) {
    gameEmbed.setDescription(`Bahis miktarı: **${bet} okane**\n\n**Senin Kartların:** ${playerHand.map(c => `${c.card}${c.suit}`).join(" ")} (Toplam: ${playerSum})\n**Krupiyenin Kartları:** ${dealerHand.map(c => `${c.card}${c.suit}`).join(" ")} (Toplam: ${dealerSum})\n\n**Sonuç:** ${result}`);
    msg.edit({ embeds: [gameEmbed], components: [] });

    if (result.includes("Kazandınız")) {
      userData.money += bet;
      message.reply(`Tebrikler, **${bet} okane** kazandınız!`);
    } else if (result.includes("Kaybettiniz")) {
      userData.money -= bet;
      message.reply(`Maalesef, **${bet} okane** kaybettiniz.`);
    }

    db.set(`economy_${message.author.id}`, userData);
  }
};

exports.conf = {
  aliases: ["bj", "blackjack"]
};

exports.help = {
  name: "blackjack"
};
