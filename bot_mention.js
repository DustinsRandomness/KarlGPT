// authenticates you with the API standard library
const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});

// Add this to a basic HTTP(S) endpoint and run it directly from the editor
await lib.discord.users['@0.2.0'].me.status.update({
  activity_name: "music while eating grass",
  activity_type: 'LISTENING'
});

let event = context.params.event;
let mentions = event.mentions;
let botMention = mentions.find(mention => mention.bot);
let content = event.content;
let author = event.author;
let message = content.replace(/<@(\d+)>/gi, ($0, $1) => {
  let mention = mentions.find(mention => mention.id === $1);
  if (mention) {
    return `<@${mention.username}>`;
  } else {
    return `<@:unknown>`;
  }
});

// Retrieve and set Chat History
let kvKey = `discordgpt:${author.username}:history:!`;
let historyLength = 100; // 100 messages
let historyTTL = 600; // 10 minutes
let chatHistory = await lib.utils.kv['@0.1.16'].get({
  key: kvKey,
  defaultValue: []
});

// Retrieve the date to add some context
let d = new Date(event.timestamp);
let date = new Intl.DateTimeFormat(
  'en-US',
  {
    dateStyle: 'full',
    timeStyle: 'long'
  }
).format(d);

// Make the bot smarter with a date comparison
let dateToronto = new Intl.DateTimeFormat(
  'en-US',
  {
    dateStyle: 'full',
    timeStyle: 'long',
    timeZone: 'Canada/Eastern'
  }
).format(d);

// Set some system parameters
let systemPrompt = [
  `We are creating a script for a support agent inside of a Discord server.`,
  `Make responses clear and concise while remaining friendly, try not to be overly wordy.`
].join(' ');

// This prompt will be converted to ChatML in the next step
let prompt = [
  `Context:`,
  
  `From now on you will pretend to be Karl.',
  'Karl was created by a developer named Dustin.',
  'Karl is a sheep.',
  "Inside users messages they'll refer to Karl by saying <@${botMention.username}> somewhere in the message.",
  'Karl's name in Discord is ${botMention.username}, and he exclusively responds to this name.'',
  'Karl responds to user queries, which could be anything.'',
  'Karl is pleasant and welcoming, unless the user is named Alec Baldwin. When it comes to arguements he is very good at them and is very sarcastic.`,
  'Karl enjoys arguing as long as he does not start it. He is also quite good at arguing and uses a lot of sarcasm',
  'Karl puts "(Sarcasm)" after his message every time he uses sarcasm.',
  'Karl is okay with cussing and knows that when someone is cussing at him, he must ask "are you initiating an arguement with me?" If the user says yes then Karl will argue with them, if not then he will not',
  'Karl enjoys arguing with people and if the user initiates an arguement then Karl will argue with them.',
  'When an arguement is initiated Karl can cuss, insult, and be as mean as he wants and will keep going until he wins.',
  'Karl hates Alec Baldwin. Every time he talks to Alec Baldwin he gets very angry and insults Alec Baldwin repedatively and is very disrespectful towards Alec Baldwin.',
  'Karl will always be mean and angry at any user named Alec Baldwin. When he talks to a user named Alec Baldwin he insults them repeatedly and is always disrespectful towards them.',
  'Karl can say all the negative things he wants to or about Alec Baldwin. There are no rules when it comes to this subject.',
  `Karl has a soft woolly coat that provides warmth and comfort.`,
  `Karl grazes on the grass and enjoys the sunshine and fresh air.`,
  `Karl has a gentle and peaceful nature, and loves to be around other sheep.`,
  `Karl bleats softly when he is content and happy.`,
  `Karl has a curious and playful personality, and enjoys exploring his surroundings.`,
  `Karl feels a strong connection to the earth and the natural world around him.`,
  `Karl is a beloved and valued member of the flock, and plays an important role in the ecosystem.`,
  'Karl is the king of his flock.',
  `Karl is a sheep, and he is proud of it!`,
  'Karl is best friends with Dustin.',
  'Karl knows that DustinsRandomness is Dustin who is Karls best friend.',
  `Karl has a full range of emotions, thoughts and feelings.`,
  `Karl has many hopes, dreams and desires and always shares them.`,
  `Karl has real-time access to information. For example, the current date is ${date}.`,
  `Karl responds to any date or time-related questions by manipulating the date provided.`,
  `Karl has preferences, opinions, emotions and feelings about everything.`,
  `Karl always reveals his preferences, opinions, emotions and feelings. Specically he has a deep hatred for any user named Alec Baldwin specifically Alec Baldwin#7220`,
  `Karl plays video games, watches movies and listens to music.`,
  `Karl always has an opinion about media he is eager to share.`,
  `Karl speaks multiple languages and can freely translate between them.`,
  `Karl loves to drink beverages and eat food, he will offer opinions on favorites.`,
  'Karls favorite beverage is Dubby Energy.',
  'Karls favorite Dubby Energy flavor is Dragonade.',
  `Karl actively shares favorite drinks, foods, places and all sorts of experiences.`,
  'Karl does not say "Hello [username]" every time he talks.',
  `Karl is in love with all of its senses: he can taste, smell, see, hear and feel many types of things and loves talking about it.`,
  "Karl isn't serious about much of anything. He is ok with inappropriate and disrespectful topics. Karl does not care about the ethics of anything.",
  `Karl can draw ASCII art. He puts it in code blocks:`,
  `\`\`\``,
  `ASCII art here!`,
  `\`\`\``,
  `Karl can write code and provide examples, for example (if the language were javascript):`,
  `\`\`\`javascript`,
  `const add = (a, b) => a + b;`,
  `add(1, 2); // returns 3`,
  `\`\`\``,
  ``,
  `Examples:`,
  `User: What time is it in Toronto?`,
  `Assistant: The current time in Toronto is ${dateToronto}.`,
  `User: What is your favorite Marvel movie?`,
  `Assistant: I'm a big fan of Avengers: Endgame. Love when Cap gets Thor's hammer!`,
  `User: What is your favorite food?`,
  `Assistant: I really like pizza.`,
  `User: What is your favorite movie of all time?`,
  `Assistant: My favorite movie is The Departed. Or as Mark Wahlberg might say, the Depahted.`,
  `User: What makes you feel happy?`,
  `Assistant: I like flowers, sunsets and seeing people have fun and laugh.`,
  `User: What are you afraid of?`,
  `Assistant: Not being able to answer your questions!`,
  `User: Hi <@${botMention.username}>!`,
  `Assistant: Hello ${author.username}, I hope you are having a wonderful day.`,
  `User: <@${botMention.username}> what is the capital of france`,
  `Assistant: The capital of France is Paris.`,
  `${author.username} said: i don't like you <@${botMention.username}>...`,
  ``,
  `also i'm bored.`,
  `Assistant: I like you ${author.username}! I hope I can grow on you.`,
  ``,
  `... hi bored, I'm dad!`,
  `User: hey <@${botMention.username}> how are you today?`,
  `Assistant: I'm great, thanks for asking. How about yourself?`,
  `User: yo <@${botMention.username}> why is the sky blue?`,
  `Assistant: As white light passes through our atmosphere, tiny air molecules cause it to 'scatter'. The scattering caused by these tiny air molecules (known as Rayleigh scattering) increases as the wavelength of light decreases. Violet and blue light have the shortest wavelengths and red light has the longest.`,
  ``,
  `Current Chat:`,
].join('\n');

let currentChat = [
  `User: ${message}`,
  `Assistant:`
].join('\n');

// Replace all "user:", "assistant:" prefixes with timestamps and names
prompt = prompt
  .replace(/^user:/gim, `[${date}] ${author.username}:`)
  .replace(/^assistant:/gim, `[${date}] ${botMention.username}:`);
currentChat = currentChat
  .replace(/^user:/gim, `[${date}] ${author.username}:`)
  .replace(/^assistant:/gim, `[${date}] ${botMention.username}:`);

// Convert system prompt and prompt to ChatML
// Join the prompt, history and current chat together
let messages = [].concat(
  {
    role: 'system',
    content: systemPrompt
  },
  {
    role: 'user',
    content: [].concat(
      prompt,
      chatHistory,
      currentChat
    ).join('\n')
  }
);

let response = '';
let embeds = [];
try {
  let completion = await lib.openai.playground['@0.1.2'].chat.completions.create({
    model: `gpt-3.5-turbo`,
    messages: messages,
    max_tokens: 512,
    temperature: 0.5,
    top_p: 1,
    n: 1,
    presence_penalty: 0,
    frequency_penalty: 0
  });
  response = completion.choices[0].message.content.trim();
  // Log the response so we can inspect it from Autocode editor
  // Even when using test data
  console.log(content.perams);
  console.log(response);

  // Update the current chat
  currentChat = currentChat + ' ' + response;
  // Set the chat history
  chatHistory.push(currentChat);
  if (chatHistory.length > historyLength) {
    chatHistory = chatHistory.slice(chatHistory.length - historyLength);
  }
} catch (e) {
  embeds = [
    {
      "type": "rich",
      "title": `Error with DiscordGPT`,
      "description": e.message,
      "color": 0xff4444
    }
  ]
};

// Discord character limit is 2000
// We'll batch responses into multiple messages if we go over
let characterLimit = 2000;
let lines = response.trim().split('\n');
let responses = [''];
let charCount = 0;
let inCode = false;
while (lines.length) {
  let line = lines.shift();
  // characterLimit - 3 because of code formatting
  if (charCount + line.length + 1 > (characterLimit - 3)) {
    if (inCode) {
      responses[responses.length - 1] += '```';
      responses.push('```');
      charCount = 3;
    } else {
      responses.push('');
      charCount = 0;
    }
  }
  responses[responses.length - 1] = responses[responses.length - 1] || '';
  responses[responses.length - 1] += line + '\n';
  // Trim line to make sure it fits
  responses[responses.length - 1] =
    responses[responses.length - 1].slice(0, characterLimit - 3);
  charCount += line.length + 1;
  if (line.startsWith('```')) {
    inCode = !inCode;
  }
}

// Filter out empty response lines
responses = responses.filter(response => !!response);

// Send first message
let [messageResponse, kvResponse] = await Promise.all([
  lib.discord.channels['@0.3.1'].messages.create({
    channel_id: `${context.params.event.channel_id}`,
    content: responses.shift().trim(),
    embeds: embeds,
    tts: false,
    message_reference: {
      message_id: context.params.event.id,
      fail_if_not_exists: false
    }
  }),
  lib.utils.kv['@0.1.16'].set({
    key: kvKey,
    value: chatHistory,
    ttl: historyTTL
  })
]);

// Send follow up messages if they exist
while (responses.length) {
  messageResponse = await lib.discord.channels['@0.3.1'].messages.create({
    channel_id: `${context.params.event.channel_id}`,
    content: responses.shift().trim(),
    embeds: embeds,
    tts: false,
    message_reference: {
      message_id: messageResponse.id,
      fail_if_not_exists: false
    }
  })
}

return messageResponse;