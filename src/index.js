// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const https = require('https');
const { Deepgram } = require('@deepgram/sdk');

require('dotenv').config();

// Create a new client instance
const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ]
});


// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
bot.once(Events.ClientReady, c => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

// Initializes the Deepgram SDK
const deepgram = new Deepgram(process.env.DEEPGRAM_API_KEY);

console.log("Deepgram initialized");

//audio if has attachment(s) and text is empty
bot.on('messageCreate', message => {
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
    console.log("audio file processing...");

    deepgram.transcription.preRecorded(
      { url: attachment.url },
      { punctuate: true, model: 'enhanced', language: 'fr' },
    ).then((transcription) => {
      // console.dir(transcription, { depth: null });
      console.log(transcription.results?.channels[0]?.alternatives[0]?.transcript);
      message.reply(transcription.results?.channels[0]?.alternatives[0]?.transcript);
    }).catch((err) => {
      console.log(err);
    });



    //downwload the audio file
    // const filename = `./audio/${attachment.id}`;
    // const file = fs.createWriteStream(filename);
    // const request = https.get(attachment.url, function (response) {
    //   response.pipe(file);
    // });





  });

});



// Log in to Discord with your client's token
bot.login(process.env.DISCORD_TOKEN);
