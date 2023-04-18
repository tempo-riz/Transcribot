// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const fs = require('fs');
const https = require('https');


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


//audio if has attachment(s) and text is empty
bot.on('messageCreate', message => {
  if (message.author.bot)
    return;

  if (message.content.length > 0)
    return;

  message.attachments.forEach(attachment => {
    //check that attatchment is audio (looking in content type)
    // console.log(attachment);
    if (!attachment.contentType.includes("audio")) {
      return;
    }

    // console.log(attachment.url);
    //downwload the audio file
    const filename = `./audio/${message.authorId}`;
    const file = fs.createWriteStream(filename);
    const request = https.get(attachment.url, function (response) {
      response.pipe(file);
    });

    //TODO
    //transcribe the audio file
    //send the text to the channel
    //(delete the audio file)

  });

});

// Log in to Discord with your client's token
bot.login(token);
