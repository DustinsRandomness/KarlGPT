// authenticates you with the API standard library
const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});
const setCustomActivityStatus = async () => {
  try {
    await lib.discord.users['@0.2.1'].me.status.update({
      activity_name: 'Supporting users',
      activity_type: 'PLAYING',
      status: 'ONLINE'
    });
    console.log('Custom activity status set successfully.');
  } catch (error) {
    console.error('Error setting custom activity status:', error);
  }
};

module.exports = async (event) => {
  await setCustomActivityStatus();
  // Rest of the code...
};
let guilds = await lib.discord.guilds['@0.2.3'].list({
  limit: 100
});

let channels = await lib.discord.guilds['@0.2.3'].channels.list({
  guild_id: guilds[0].id
});

let generalChannel = channels.find((channel) => {
  return channel.name === 'general';
});

if (generalChannel) {
  let botInfo = await lib.discord.users['@0.2.0'].me.list();
  await lib.discord.channels['@0.3.1'].messages.create({
    channel_id: generalChannel.id,
    content: [
      `Hey there! Thanks for installing this AI-powered Discord bot that uses OpenAI's GPT-3 to generate messages.`,
      `Try mentioning me in a message like this: <@!${botInfo.id}>`,
      ``,
      `Please note that your bot will have to enable the **Message Content Privileged Intent** to work.`,
    ].join('\n'),
    embeds: [
      {
        title: 'Enabling Privileged Intents',
        type: 'rich',
        color: 0x00AA00, // Green color
        description: [
          'Check out this link for more details on enabling Privileged Intents:',
          'https://autocode.com/discord/threads/what-are-discord-privileged-intents-and-how-do-i-enable-them-tutorial-0c3f9977/'
        ].join('\n')
      },
      {
        title: 'More about this bot',
        type: 'rich',
        color: 0x00AA00,
        description: [
          'This bot is a ChatGPT like bot coded by Dustin. It is convinced that it is a sheep named Karl.'
        ].join('\n')
      }
    ]
  });
}