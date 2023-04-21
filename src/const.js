
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



const COUNTRY_FLAGS = {
    'fr': '🇫🇷',
    'en': '🇺🇸',
    'es': '🇪🇸',
    'de': '🇩🇪',
};


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

module.exports = {
    COUNTRY_FLAGS,
    commands
}