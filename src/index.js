// Require the necessary discord.js classes
require('dotenv').config();
const { Client, Events, GatewayIntentBits } = require('discord.js');
const { Deepgram } = require('@deepgram/sdk');

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

const CommandOptionType = {
  SUB_COMMAND: 1,
  SUB_COMMAND_GROUP: 2,
  STRING: 3,
  INTEGER: 4,
  BOOLEAN: 5,
  USER: 6,
  CHANNEL: 7,
  ROLE: 8,
  MENTIONABLE: 9,
  NUMBER: 10,
};

let LANGUAGE = 'fr';
let ENABLED = true;

const COUNTRY_FLAGS = {
  'fr': '🇫🇷',
  'en': '🇺🇸',
  'es': '🇪🇸',
  'de': '🇩🇪',
};


// Create a new client instance
const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ]
});

const commands = [
  {
    name: 'help',
    description: 'Replies with a list of all my commands!',
  },
  {
    name: 'setlanguage',
    description: 'Sets the language for the bot',
    options: [
      {
        name: 'language',
        description: 'The language to set',
        type: CommandOptionType.STRING,
        // https://developers.deepgram.com/documentation/features/language/
        choices: [
          {
            name: 'French',
            value: 'fr'
          },
          {
            name: 'English',
            value: 'en'
          },
          {
            name: 'Spanish',
            value: 'es'
          },
          {
            name: 'German',
            value: 'de'
          }
        ],
        required: true,
      }]
  },
  {
    name: 'enable',
    description: 'Enables the bot',
  },
  {
    name: 'disable',
    description: 'Disables the bot',
  },
  // {
  //   name: 'react',
  //   description: 'Reacts to your message',
  // },
];


// Initializes the Deepgram SDK
const deepgram = new Deepgram(process.env.DEEPGRAM_API_KEY);
console.log("Deepgram initialized");

// When the client is ready, run this code (only once)
bot.once(Events.ClientReady, async c => {
  console.log(`Ready! Logged in as ${c.user.tag}`);

  try {
    await rest.put(
      Routes.applicationCommands(process.env.APPLICATION_ID),
      { body: commands },
    );

    console.log('Successfully registered application commands.');
  } catch (error) {
    console.error(error);
  }

});

//audio if has attachment(s) and text is empty
bot.on('messageCreate', message => {

  if (!ENABLED)
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

    console.log(attachment.url);
    console.log("transcription processing...");
    
    message.react(COUNTRY_FLAGS[LANGUAGE]);

    deepgram.transcription.preRecorded(
      { url: attachment.url },
      { punctuate: true, model: 'enhanced', language: LANGUAGE },
    ).then((transcription) => {
      // console.dir(transcription, { depth: null });
      console.log(transcription.results?.channels[0]?.alternatives[0]?.transcript);
      message.reply(transcription.results?.channels[0]?.alternatives[0]?.transcript);
    }).catch((err) => {
      console.log(err);
    });
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
    LANGUAGE = language;
    await interaction.reply(`Language set to ${COUNTRY_FLAGS[LANGUAGE]} !`);

  } else if (interaction.commandName === 'enable') {
    //enable bot
    ENABLED = true;
    await interaction.reply('Bot enabled !');

  } else if (interaction.commandName === 'disable') {
    //disable bot
    ENABLED = false;
    await interaction.reply('Bot disabled !');

  } else if (interaction.commandName === 'react') {
    await interaction.reply('Reacting to your message...');
    const message = await interaction.fetchReply();
    message.react('👍')
      .then(() => message.react('👎'))
      .then(() => message.react('🤷'))
      .catch(() => console.error('One of the reactions failed to load.'));
  } else {  //unknown command
    await interaction.reply('Unknown command !');
  }

});


// Log in to Discord with your client's token
bot.login(process.env.DISCORD_TOKEN);
