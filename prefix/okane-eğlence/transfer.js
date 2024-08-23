const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Colors } = require("discord.js");
const db = require("croxydb");

exports.run = async (client, message, args) => {
  const economyEnabled = db.get("economyEnabled");
  if (!economyEnabled) {
    return message.reply("Ekonomi sistemi şu anda kapalı.");
  }

  let sender = message.author;
  let receiver = message.mentions.users.first();
  let amount = parseInt(args[1]);

  if (!receiver || isNaN(amount)) {
    return message.reply("Lütfen bir kullanıcı ve miktar belirtin.");
  }

  let senderData = db.get(`economy_${sender.id}`) || { money: 0 };
  let receiverData = db.get(`economy_${receiver.id}`) || { money: 0 };

  if (senderData.money < amount) {
    return message.reply("Yeterli paranız yok.");
  }

  const confirmEmbed = new EmbedBuilder()
    .setColor(Colors.Yellow)
    .setTitle("Transfer Onayı")
    .setDescription(`${receiver}, ${sender} size **${amount} okane** göndermek istiyor. Onaylıyor musunuz?`);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('confirm')
      .setLabel('Onayla')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('cancel')
      .setLabel('Reddet')
      .setStyle(ButtonStyle.Danger)
  );

  const confirmMessage = await message.reply({ embeds: [confirmEmbed], components: [row] });

  const filter = interaction => {
    return ['confirm', 'cancel'].includes(interaction.customId) && 
           (interaction.user.id === receiver.id || interaction.user.id === sender.id);
  };

  const collector = confirmMessage.createMessageComponentCollector({ filter, time: 60000 });

  let senderConfirmed = false;
  let receiverConfirmed = false;

  collector.on('collect', async interaction => {
    if (interaction.user.id !== sender.id && interaction.user.id !== receiver.id) {
      return interaction.reply({ content: 'Bu butona sadece işlemdeki kullanıcılar basabilir.', ephemeral: true });
    }

    if (interaction.customId === 'confirm') {
      if (interaction.user.id === sender.id) {
        senderConfirmed = true;
        await interaction.reply({ content: 'Transferi onayladınız.', ephemeral: true });
      } else if (interaction.user.id === receiver.id) {
        receiverConfirmed = true;
        await interaction.reply({ content: 'Transferi onayladınız.', ephemeral: true });
      }

      if (senderConfirmed && receiverConfirmed) {
        senderData.money -= amount;
        receiverData.money += amount;

        db.set(`economy_${sender.id}`, senderData);
        db.set(`economy_${receiver.id}`, receiverData);

        const successEmbed = new EmbedBuilder()
          .setColor(Colors.Green)
          .setTitle("Transfer Başarılı")
          .setDescription(`${receiver.tag} adlı kullanıcıya ${amount} okane gönderildi.`);

        await confirmMessage.edit({ embeds: [successEmbed], components: [] });
        collector.stop();
      }
    } else if (interaction.customId === 'cancel') {
      const cancelEmbed = new EmbedBuilder()
        .setColor(Colors.Red)
        .setTitle("Transfer İptal Edildi")
        .setDescription("Para transferi iptal edildi.");

      await confirmMessage.edit({ embeds: [cancelEmbed], components: [] });
      collector.stop();
    }
  });

  collector.on('end', collected => {
    if (!senderConfirmed || !receiverConfirmed) {
      const timeoutEmbed = new EmbedBuilder()
        .setColor(Colors.Red)
        .setTitle("Transfer Süresi Doldu")
        .setDescription("Transfer işlemi zaman aşımına uğradı.");

      confirmMessage.edit({ embeds: [timeoutEmbed], components: [] });
    }
  });
};

exports.conf = {
  aliases: ["ok-transfer", "oktr"]
};

exports.help = {
  name: "transfer"
};
