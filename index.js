const { Client, GatewayIntentBits, Partials } = require("discord.js");
const config = require("./config.js");
const db = require("./croxydb/croxydb.json");

const client = new Client({
  partials: [
    Partials.Message, 
    Partials.Channel, 
    Partials.GuildMember,
    Partials.Reaction, 
    Partials.GuildScheduledEvent, 
    Partials.User, 
    Partials.ThreadMember, 
  ],
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites, 
    GatewayIntentBits.GuildVoiceStates, 
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions, 
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.MessageContent, 
  ],
});

module.exports = client;

const fs = require("fs");
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
  require("./events/"+file);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
➤ | ${file} Eventi yüklendi!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
}

client.login(config.token).catch(e => {
console.log(`──────────────────────────────────────────
✕ | Geçersiz Bot Tokeni!
──────────────────────────────────────────`)
})

