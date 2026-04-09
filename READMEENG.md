# 🌟 Naofumi Discord.js v14 MultiPurpose Bot 🌟

<p align="center">
  <a href="https://api.weblutions.com/discord/invite/dvCKjxHn35">
    <img src="https://api.weblutions.com/discord/invite/dvCKjxHn35" alt="Weeb.dev Discord" />
  </a>
</p>

🤖 **Slash and prefix Discord bot** 🤖

[🇹🇷 Türkçe sürümü okumak için buraya tıklayın](README.md)

---

## 📋 Table of Contents

- [🔧 Requirements](#requirements)
- [🚀 Getting Started](#getting-started)
- [👤 Author](#author)
- [💾 Installation](#installation)
- [🚀 All Features](#-all-features)
- [✨ New Features v1.2.0](#new-features-v120)

---

## 🔧 Requirements

- [Node.js](https://nodejs.org/en/) v21 or higher
- Discord.js v14

## 🚀 Getting Started

First, make sure all the necessary tools are installed on your local machine, and then continue with these steps.

---

## 🚀 All Features

Naofumi offers a wide range of features to manage and liven up your server:

### 🛡️ Moderation
- **Advanced Ban/Kick**: Ban or kick users with ease.
- **Timeout**: Set timed silences and remove them.
- **Channel Management**: Reset channels with `nuke`, manage access with `lock/unlock`.
- **Message Clearing**: Quickly clean up channels.

### ⚙️ Systems
- **🎫 Support (Ticket)**: Button-based ticket system with HTML transcript support.
- **🛡️ Protection & Anti-Raid**: Protects the server against attacks and spam.
- **🎭 Autorole & Welcome/Goodbye**: Automatic roles for new members and customized greeting messages.
- **🎤 Private Room**: System for users to create their own private voice channels.
- **📊 Logging**: Tracks message deletions, edits, and server events.

### 💰 Economy and Fun
- **💴 Okane System**: Daily rewards, balance tracking, and user-to-user transfers.
- **🎰 Casino**: Slot, Blackjack, and games of chance.
- **🎮 Games**: Hangman, Number Guessing, Word Chain.
- **🏮 Anime Trivia**: Quiz system to test your anime knowledge.

### 📊 General and Info
- **🔍 Info**: Detailed statistics about the server, users, and the bot.
- **🖼️ Visuals**: View Avatars and Banners (User/Server).
- **🌡️ Weather**: Real-time weather information from around the world.
- **📝 Snipe**: View the last deleted message.

### 🎁 Giveaway System
- **🎉 Giveaway**: Easily start giveaways, determine winners, and select rerolls.

---

## ✨ New Features v1.2.0

- **📄 Premium Ticket Transcripts**: Professional HTML transcripts are automatically generated and sent to the log channel when support tickets are closed.
- **🖼️ Napi-RS Canvas Integration**: Switched to `@napi-rs/canvas` for image processing to ensure maximum performance and compatibility on Windows VDS environments.
- **🚀 Memory & Performance Optimization**: Completely resolved memory leaks by removing redundant event listeners in command files.
- **🛠️ Enhanced Interaction Management**: Discord interactions are now handled more securely, minimizing "Interaction failed" errors.
- **🛡️ Advanced Error Management**: Strengthened error catching and logging mechanisms in moderation and system commands.

## ✨ Features v1.1.0

- **🌡️ Weather Command**: Use `/weather [city]` and `n.weather [city]` to get weather information from around the world.
- **🎰 Slot Machine**: Test your luck with the `n.slot [amount]` command through the economy system.
- **💰 Rob Command**: Try to steal money from other users with `n.rob @user`.
- **🛡️ Anti-Raid System**: Protect your server from sudden attacks with the `/antiraid` command.
- **📊 Enhanced Bot Info Command**: Access detailed information about the bot with `/info` and `n.info`.
- **🏓 Ping Command**: Measure bot and API latency with `/ping` and `n.ping`.
- **⚙️ More Stable and Optimized Performance**: Enhanced error handling, you'll experience fewer issues.

## 💾 Installation

* [💻 VDS Installation](#vds)

### 💻 VDS

```bash
# 📂 Clone the repository
git clone https://github.com/oktayyavuz/naofumi

# 📁 Enter the directory
cd naofumi/

# 📦 Install necessary packages
npm install

# ⚙️ Personal settings
# Fill in the requirements in the config.js file
```

### 🛠️ Required Permissions

Make sure the "applications.commands" application scope is enabled under the "OAuth2" tab in the [developer portal](https://discord.com/developers/applications/).

Enable "Server Member Intents" and "Message Intents" found under the "Bot" tab in the [developer portal](https://discord.com/developers/applications/).

### ⚙️ Configuration

After cloning the project and installing all dependencies, you need to add your Discord API token to the 'config.token' file.

### 🔄 Changing Status

You can change the status of your Discord bot by editing the `activities` variables in the `/events/ready.js` file. By modifying the `ActivityType.Watching` section, you can set it to `Watching`, `Playing`, etc.

### 🚀 Running the Application

```bash
node index.js
```
or

```bash
npm run start
```
or

```bash
# 🖥️ Run the run.bat file
```

## 👤 Author

[Oktay Yavuz](https://oktaydev.com/)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE) file for details. 