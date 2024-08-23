const { EmbedBuilder, Colors } = require("discord.js");
const db = require("croxydb");

const triviaQuestions = [
  {
    question: "Hangi anime, 'Shinigami'lerin dünyasına gelen bir lise öğrencisini anlatır?",
    options: ["Death Note", "Bleach", "Naruto", "One Piece"],
    answer: "Death Note"
  },
  {
    question: "Hangi anime karakteri, 'Konoha'nın 7. Hokage'sidir?",
    options: ["Naruto Uzumaki", "Sasuke Uchiha", "Kakashi Hatake", "Jiraiya"],
    answer: "Naruto Uzumaki"
  },
  {
    question: "Hangi anime, devasa canavarlara karşı savaşan bir insan grubunu konu alır?",
    options: ["Attack on Titan", "Fullmetal Alchemist", "Sword Art Online", "Cowboy Bebop"],
    answer: "Attack on Titan"
  },
  {
    question: "Hangi anime karakteri, 'Dragon Ball' evreninde en güçlü savaşçılardan biridir?",
    options: ["Goku", "Vegeta", "Gohan", "Piccolo"],
    answer: "Goku"
  },
  {
    question: "Hangi anime, 'Demon Slayer' adlı bir karakterin hikayesini anlatır?",
    options: ["Demon Slayer", "My Hero Academia", "Tokyo Ghoul", "One Punch Man"],
    answer: "Demon Slayer"
  },
  {
    question: "Hangi anime, 'Fullmetal Alchemist' adlı bir kardeşlerin hikayesini konu alır?",
    options: ["Fullmetal Alchemist", "Fairy Tail", "Bleach", "Black Clover"],
    answer: "Fullmetal Alchemist"
  },
  {
    question: "Hangi anime, bir çeteye liderlik eden bir gencin hikayesini anlatır?",
    options: ["One Piece", "Naruto", "Tokyo Revengers", "Death Note"],
    answer: "Tokyo Revengers"
  },
  {
    question: "Hangi anime karakteri, 'Deku' olarak bilinir?",
    options: ["Izuku Midoriya", "Katsuki Bakugo", "Shoto Todoroki", "All Might"],
    answer: "Izuku Midoriya"
  },
  {
    question: "Hangi anime, bir grup arkadaşın fantastik bir dünyada maceralarını konu alır?",
    options: ["Fairy Tail", "Sword Art Online", "Black Clover", "Naruto"],
    answer: "Fairy Tail"
  },
  {
    question: "Hangi anime karakteri, 'L' olarak bilinen dedektife karşı savaşır?",
    options: ["Light Yagami", "Near", "Mello", "Ryuk"],
    answer: "Light Yagami"
  },
  {
    question: "Hangi anime, 'Kakashi Hatake' adlı bir ninjanın hikayesini anlatır?",
    options: ["Naruto", "Dragon Ball", "One Piece", "Bleach"],
    answer: "Naruto"
  },
  {
    question: "Hangi anime, 'Nezuko Kamado' adlı bir karakteri konu alır?",
    options: ["Demon Slayer", "Attack on Titan", "Fullmetal Alchemist", "My Hero Academia"],
    answer: "Demon Slayer"
  },
  {
    question: "Hangi anime, 'Guts' adlı bir karakterin karanlık bir dünyada hayatta kalma mücadelesini anlatır?",
    options: ["Berserk", "Hunter x Hunter", "One Piece", "Bleach"],
    answer: "Berserk"
  },
  {
    question: "Hangi anime, 'Kallen Stadtfeld' adlı bir karakteri içerir?",
    options: ["Code Geass", "Cowboy Bebop", "Death Note", "Fullmetal Alchemist"],
    answer: "Code Geass"
  },
  {
    question: "Hangi anime, 'Saitama' adlı karakterin tek vuruşla düşmanları yenmesini konu alır?",
    options: ["One Punch Man", "My Hero Academia", "Naruto", "Bleach"],
    answer: "One Punch Man"
  },
  {
    question: "Hangi anime karakteri, 'Luffy' olarak bilinir ve denizlerde macera arar?",
    options: ["Monkey D. Luffy", "Goku", "Natsu Dragneel", "Kirito"],
    answer: "Monkey D. Luffy"
  },
  {
    question: "Hangi anime, 'Mikasa Ackerman' adlı bir karakteri içerir?",
    options: ["Attack on Titan", "Death Note", "Fullmetal Alchemist", "Sword Art Online"],
    answer: "Attack on Titan"
  },
  {
    question: "Hangi anime, 'Lain Iwakura' adlı karakterin psikolojik ve felsefi yolculuğunu konu alır?",
    options: ["Serial Experiments Lain", "Elfen Lied", "Cowboy Bebop", "Ghost in the Shell"],
    answer: "Serial Experiments Lain"
  },
  {
    question: "Hangi anime, 'Inuyasha' adlı bir karakterin fantastik bir dünyada geçirdiği maceraları anlatır?",
    options: ["Inuyasha", "Naruto", "Bleach", "One Piece"],
    answer: "Inuyasha"
  },
  {
    question: "Hangi anime, 'Haruhi Suzumiya' adlı karakterin etrafında döner?",
    options: ["The Melancholy of Haruhi Suzumiya", "Clannad", "Toradora", "Angel Beats!"],
    answer: "The Melancholy of Haruhi Suzumiya"
  }
];

exports.run = async (client, message, args) => {
  const economyEnabled = db.get("economyEnabled");

  if (!economyEnabled) {
    return message.reply("Ekonomi sistemi şu anda kapalı.");
  }

  const userData = db.get(`economy_${message.author.id}`) || { money: 0 };

  const randomQuestion = triviaQuestions[Math.floor(Math.random() * triviaQuestions.length)];
  const optionsString = randomQuestion.options.map((opt, index) => `${index + 1}. ${opt}`).join("\n");

  const quizEmbed = new EmbedBuilder()
    .setColor(Colors.Blue)
    .setTitle("Anime Trivia Quiz")
    .setDescription(`${randomQuestion.question}\n\n${optionsString}`)
    .setFooter({ text: "Cevabınızı 1, 2, 3 veya 4 olarak girin." });

  const msg = await message.reply({ embeds: [quizEmbed] });

  const filter = response => {
    const choice = parseInt(response.content);
    return response.author.id === message.author.id && [1, 2, 3, 4].includes(choice);
  };

  const collector = message.channel.createMessageCollector({ filter, time: 30000 });

  collector.on('collect', response => {
    const choice = parseInt(response.content);
    if (randomQuestion.options[choice - 1] === randomQuestion.answer) {
      userData.money += 500; 
      db.set(`economy_${message.author.id}`, userData);

      const correctEmbed = new EmbedBuilder()
        .setColor(Colors.Green)
        .setTitle("Tebrikler!")
        .setDescription(`Doğru cevap verdiniz! **${500} okane** kazandınız.`)
        .setFooter({ text: "Yeni bir soru için tekrar komut girin." });

      message.reply({ embeds: [correctEmbed] });
    } else {
      const incorrectEmbed = new EmbedBuilder()
        .setColor(Colors.Red)
        .setTitle("Yanlış Cevap!")
        .setDescription(`Üzgünüm, doğru cevap **${randomQuestion.answer}** idi.`)
        .setFooter({ text: "Yeni bir soru için tekrar komut girin." });

      message.reply({ embeds: [incorrectEmbed] });
    }

    collector.stop();
  });

  collector.on('end', (_, reason) => {
    if (reason === 'time') {
      const timeoutEmbed = new EmbedBuilder()
        .setColor(Colors.Orange)
        .setTitle("Süre Doldu!")
        .setDescription("Maalesef süre doldu. Yeni bir soru için tekrar komut girin.")
        .setFooter({ text: "İyi şanslar!" });

      msg.edit({ embeds: [timeoutEmbed], components: [] });
    }
  });
};

exports.conf = {
  aliases: ["trivia", "quiz"]
};

exports.help = {
  name: "trivia"
};
