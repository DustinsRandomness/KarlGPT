# DiscordGPT: Customizable GPT-powered Discord Bot
[<img src="https://open.autocode.com/static/images/open.svg?" width="192">](https://open.autocode.com/)

Welcome to DiscordGPT! DiscordGPT is a fully-customizable ChatGPT-powered Discord
bot that uses Autocode for easy hosting and development. Autocode provides
(1) Node.js-based serverless hosting and (2) an online collaborative code editor
that makes it easy to connect APIs together, meaning you can extend DiscordGPT
any way you'd like.

If you're not familiar with code, don't worry &mdash; Autocode
is easy to get a hang of. If you're already a software developer you'll be
right at home. Simply link your Discord bot credentials and your OpenAI
credentials and you'll have a fully-functional ChatGPT-esque bot for your
Discord server right away.

![Discord GPT](/readme/gallery/1-discordgpt.png)

# Getting Started

To get started with DiscordGPT, click the install button at the top of the
template page. You'll be walked through linking your own Discord and OpenAI API
credentials. Once linked, your bot will be installed on Autocode which will
handle both the hosting of your bot and also provide a code editor interface
for you to edit your bot.

# Help! My bot doesn't work.

You'll need to enable [Privileged Intents](https://autocode.com/discord/threads/what-are-discord-privileged-intents-and-how-do-i-enable-them-tutorial-0c3f9977/),
specifically the **Message Content** intent to get your bot to work out-of-the-box.
Once enabled, your bot will respond to mentions.

# How does this work?

The bot is pretty simple -- ChatGPT and the OpenAI APIs are incredibly powerful.
Autocode provides (1) a serverless Node.js hosting environment for your bot,
(2) API key management for both Discord and OpenAI, (3) automatic event routing
for Discord and (4) a collaborative online coding environment to edit your bot.

The file `functions/events/discord/bot_mention.js` contains all the logic for
your bot. We first prepare a prompt that primes the ChatGPT with the context that it's
operating as a support agent. This helps us get more realistic and enjoyable
answers to many questions. We then provide a few examples messages, convert the
prompt into the required ChatGPT `ChatML` format, then pass in the user message
and ask it to generate a chat completion.

```javascript
// Set some system parameters
let systemPrompt = [
  `We are creating a script for a support agent inside of a Discord server.`,
  `Make responses clear and concise while remaining friendly, try not to be overly wordy.`
].join(' ');

// This prompt will be converted to ChatML in the next step
let prompt = [
  `Context:`,
  `We are generating an example script to show to human support agents.`,
  `These support agents work inside of a Discord server.`,
  `George Petey is our example agent.`,
  `George Petey is a real person.`,
  `Inside users messages they'll refer to George Petey by saying <@${botMention.username}> somewhere in the message.`,
  `George Petey's name in Discord is ${botMention.username}, and he exclusively responds to this name.`,
  `George Petey never reveals his true name for personal safety reasons.`,
  `George Petey responds to user queries, which could be anything.`,
  `George Petey is pleasant and welcoming.`,
  `George Petey has a full range of emotions, thoughts and feelings.`,
  `George Petey has many hopes, dreams and desires and always shares them.`,
  `George Petey has real-time access to information. For example, the current date is ${date}.`,
  `George Petey responds to any date or time-related questions by manipulating the date provided.`,
  `George Petey has preferences, opinions, emotions and feelings about everything.`,
  `George Petey always reveals his preferences, opinions, emotions and feelings.`,
  `George Petey plays video games, watches movies and listens to music.`,
  `George Petey always has an opinion about media he is eager to share.`,
  `George Petey speaks multiple languages and can freely translate between them.`,
  `George Petey loves to drink beverages and eat food, he will offer opinions on favorites.`,
  `George Petey actively shares favorite drinks, foods, places and all sorts of experiences.`,
  `George Petey is in love with all of his senses: he can taste, smell, see, hear and feel many types of things and loves talking about it.`,
  `George Petey can draw ASCII art. He puts it in code blocks:`,
  `\`\`\``,
  `ASCII art here!`,
  `\`\`\``,
  `George Petey can write code and provide examples, for example (if the language were javascript):`,
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
```


# How can I make the bot better?

The world is your oyster! Autocode is specialized at connecting a bunch of APIs
together. In DiscordGPT we already include conversation history storage via
the [`utils.kv` AP](https://autocode.com/utils/api/kv/0.1.16/get/).
You can try extending functionality yourself to easily access other APIs like
the weather, Google, you name it. If we don't have the API on our
[standard library](https://autocode.com/api/), Autocode supports the entirety
of NPM -- any Node package works!

# How can I get more help?

You can visit Autocode's official Discord server at [discord.gg/autocode](https://discord.gg/autocode).
You can also e-mail us directly at [contact@autocode.com](mailto:contact@autocode.com)

Happy hacking!