require('dotenv').config();
const { Client, Events, GatewayIntentBits } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

const { saveMessage, saveAllServerSettings, updateServerSettings, loadAllServerSettings } = require('./firebase.js');
const { COUNTRY_FLAGS, commands } = require('./const.js');
const { transcript } = require('./deepgram.js');

//settings for each guild the bot is in
let GUILD_SETTINGS = new Map();


const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    // GatewayIntentBits.GuildMembers,
  ]
});


// When the client is ready, run this code (only once)
bot.once(Events.ClientReady, async c => {
  GUILD_SETTINGS = await loadAllServerSettings();

  console.log("Servers: ");
  //check if there is a new server, if so add it to the list
  bot.guilds.cache.forEach((guild) => {
    if (!GUILD_SETTINGS.has(guild.id)) {
      GUILD_SETTINGS.set(guild.id, { name: guild.name, language: 'fr', enabled: true });
      updateServerSettings(guild.id, { name: guild.name, language: 'fr', enabled: true });
      console.log("[NEW]: " + guild.name);
    } else {
      console.log(guild.name);
    }
  })
  console.log(`\n${c.user.username} is ready !`);



  try {
    await rest.put(
      Routes.applicationCommands(process.env.APPLICATION_ID),
      { body: commands },
    );
  } catch (error) {
    console.error(error);
  }



});

//audio if has attachment(s) and text is empty
bot.on('messageCreate', message => {

  if (!GUILD_SETTINGS.get(message.guild.id).enabled)
    return;
  if (message.author.bot)
    return;
  if (message.content.length > 0)
    return;

  message.attachments.forEach(attachment => {
    //check that attatchment is audio (looking in content type)
    if (!attachment.contentType.includes("audio")) {
      return;
    }

    message.react(COUNTRY_FLAGS[GUILD_SETTINGS.get(message.guild.id).language]);
    console.log("transcripting:", attachment.url);

    transcript(attachment,GUILD_SETTINGS.get(message.guild.id).language).then(text => {

      message.reply(text);
      console.log(text);
      const m = {
        text: text,
        author: message.author.username + "#" + message.author.discriminator,
        date: new Date().toISOString(),
        guild: message.guild.name,
        channel: message.channel.name,
        audio: attachment.url,
        ids: {
          messageId: message.id,
          authorId: message.author.id,
          guildId: message.guild.id,
          channelId: message.channel.id,
        }
      }
      saveMessage(m);
    })
  });
});


bot.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'help') {
    let reply = "Here's a list of all my commands:";
    //remove first command (help)
    commands.slice(1).forEach(command => {
      reply += `\n - ${command.name}: ${command.description}`;
    });
    await interaction.reply(reply);

  } else if (interaction.commandName === 'setlanguage') {
    //set language for bot
    const language = interaction.options.getString('language');
    GUILD_SETTINGS.get(interaction.guild.id).language = language;
    updateServerSettings(interaction.guild.id, GUILD_SETTINGS);
    await interaction.reply(`Language set to ${COUNTRY_FLAGS[GUILD_SETTINGS.get(interaction.guild.id).language]} ${language}`);

  } else if (interaction.commandName === 'enable') {
    //enable bot
    GUILD_SETTINGS.get(interaction.guild.id).enabled = true;
    updateServerSettings(interaction.guild.id, GUILD_SETTINGS);
    await interaction.reply('Bot enabled !');

  } else if (interaction.commandName === 'disable') {
    //disable bot
    GUILD_SETTINGS.get(interaction.guild.id).enabled = false;
    updateServerSettings(interaction.guild.id, GUILD_SETTINGS);
    await interaction.reply('Bot disabled !');

  } else {  //unknown command
    await interaction.reply('Unknown command !');
  }

});


bot.login(process.env.DISCORD_TOKEN);
