const { EmbedBuilder, Colors } = require("discord.js");
const db = require("croxydb");
const client = require("../index.js");
const timeMap = new Map();

client.on("voiceStateUpdate", (oldState, newState) => {
  const user = newState.member.user;
  const userId = user.id;
  const guildId = newState.guild.id;

  if (!newState.channel && oldState.channel) {
    const joinTime = timeMap.get(userId);
    if (joinTime) {
      const duration = Date.now() - joinTime;
      const minutes = Math.floor(duration / 60000);

      if (minutes > 0) {
        const reward = minutes * 100;
        let userData = db.get(`economy_${userId}`) || { money: 0, level: 1, xp: 0 };

        userData.money += reward;
        db.set(`economy_${userId}`, userData);

        const embed = new EmbedBuilder()
          .setColor(Colors.Green)
          .setDescription(`${user}, ses kanalında geçirdiğin **${minutes} dakika** için **${reward} okane** kazandın!`);

        oldState.guild.channels.cache.get(oldState.channelId).send({ embeds: [embed] });
      }

      timeMap.delete(userId);
    }
  }

  if (newState.channel && !oldState.channel) {
    timeMap.set(userId, Date.now());
  }
});
