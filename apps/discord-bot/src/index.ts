import 'dotenv/config'
import {
  Client,
  GatewayIntentBits,
  Events,
  REST,
  Routes,
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Message,
  ChannelType
} from 'discord.js'
import { quickAgent, CommunityAgent } from '@grepcoin/agents'

// Configuration
const DISCORD_TOKEN = process.env.DISCORD_TOKEN!
const CLIENT_ID = process.env.DISCORD_CLIENT_ID!
const GUILD_ID = process.env.DISCORD_GUILD_ID // Optional: for development

// Channels where the bot responds to all messages
const AUTO_RESPONSE_CHANNELS = ['support', 'help', 'questions', 'ask-grepbot']

// Initialize Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
})

// Initialize AI agent
let agent: CommunityAgent

// Slash commands
const commands = [
  new SlashCommandBuilder()
    .setName('ask')
    .setDescription('Ask GrepBot a question about GrepCoin')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('Your question')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('games')
    .setDescription('Get information about GrepCoin games')
    .addStringOption(option =>
      option.setName('game')
        .setDescription('Specific game name')
        .setRequired(false)
        .addChoices(
          { name: 'Grep Rails', value: 'grep-rails' },
          { name: 'Stack Panic', value: 'stack-panic' },
          { name: 'Merge Miners', value: 'merge-miners' },
          { name: 'Quantum Grep', value: 'quantum-grep' },
          { name: 'Bug Hunter', value: 'bug-hunter' },
          { name: 'Crypto Snake', value: 'crypto-snake' },
          { name: 'Syntax Sprint', value: 'syntax-sprint' },
          { name: 'RegEx Crossword', value: 'regex-crossword' }
        )
    ),

  new SlashCommandBuilder()
    .setName('staking')
    .setDescription('Get staking information')
    .addStringOption(option =>
      option.setName('tier')
        .setDescription('Specific tier')
        .setRequired(false)
        .addChoices(
          { name: 'Flexible', value: 'flexible' },
          { name: 'Bronze', value: 'bronze' },
          { name: 'Silver', value: 'silver' },
          { name: 'Gold', value: 'gold' },
          { name: 'Diamond', value: 'diamond' }
        )
    ),

  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Get help with GrepCoin'),

  new SlashCommandBuilder()
    .setName('links')
    .setDescription('Get useful GrepCoin links')
].map(command => command.toJSON())

// Register slash commands
async function registerCommands() {
  const rest = new REST().setToken(DISCORD_TOKEN)

  try {
    console.log('Registering slash commands...')

    if (GUILD_ID) {
      // Guild-specific (instant, for development)
      await rest.put(
        Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
        { body: commands }
      )
    } else {
      // Global (takes up to 1 hour to propagate)
      await rest.put(
        Routes.applicationCommands(CLIENT_ID),
        { body: commands }
      )
    }

    console.log('Slash commands registered!')
  } catch (error) {
    console.error('Error registering commands:', error)
  }
}

// Handle slash commands
async function handleCommand(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply()

  try {
    let response: string

    switch (interaction.commandName) {
      case 'ask':
        const question = interaction.options.getString('question', true)
        response = await agent.answerQuestion(question)
        break

      case 'games':
        const game = interaction.options.getString('game')
        if (game) {
          response = await agent.chat(`Tell me about the ${game} game in GrepCoin.`)
        } else {
          response = await agent.chat('List all 8 games in GrepCoin with brief descriptions.')
        }
        break

      case 'staking':
        const tier = interaction.options.getString('tier')
        if (tier) {
          response = await agent.chat(`Explain the ${tier} staking tier in GrepCoin.`)
        } else {
          response = await agent.chat('Explain all 5 staking tiers in GrepCoin with their benefits.')
        }
        break

      case 'help':
        response = `**GrepBot Help**

I'm GrepBot, your AI assistant for GrepCoin! Here's what I can help with:

**Commands:**
• \`/ask <question>\` - Ask me anything about GrepCoin
• \`/games [game]\` - Get info about our arcade games
• \`/staking [tier]\` - Learn about staking and rewards
• \`/links\` - Get useful links

**Quick Topics:**
• How to play and earn GREP
• Staking tiers and multipliers
• Wallet setup
• Token information

Just ask in the support channels and I'll help! 🎮`
        break

      case 'links':
        response = `**GrepCoin Links**

🎮 **Play Games:** https://grepcoin.io/games
💰 **Fundraise:** https://grepcoin.io/fundraise
📖 **Docs:** https://grepcoin.io/docs
🐙 **GitHub:** https://github.com/grepcoin/grepcoin
🐦 **Twitter:** https://twitter.com/grepcoin

📜 **Legal:**
• Terms: https://grepcoin.io/terms
• Privacy: https://grepcoin.io/privacy
• Disclaimer: https://grepcoin.io/disclaimer`
        break

      default:
        response = "I don't recognize that command. Try `/help` for available commands."
    }

    await interaction.editReply(response.slice(0, 2000)) // Discord limit
  } catch (error) {
    console.error('Command error:', error)
    await interaction.editReply('Sorry, I encountered an error. Please try again.')
  }
}

// Handle direct messages and mentions
async function handleMessage(message: Message) {
  // Ignore bots
  if (message.author.bot) return

  // Check if in auto-response channel
  const channelName = message.channel.type === ChannelType.GuildText
    ? message.channel.name.toLowerCase()
    : ''

  const shouldRespond =
    message.mentions.has(client.user!) ||
    AUTO_RESPONSE_CHANNELS.some(ch => channelName.includes(ch)) ||
    message.channel.type === ChannelType.DM

  if (!shouldRespond) return

  // Show typing indicator
  if (message.channel.type !== ChannelType.DM) {
    await (message.channel as any).sendTyping()
  }

  try {
    // Remove bot mention from message
    const content = message.content
      .replace(new RegExp(`<@!?${client.user!.id}>`, 'g'), '')
      .trim()

    if (!content) {
      await message.reply("Hi! I'm GrepBot. Ask me anything about GrepCoin, or try `/help` for commands!")
      return
    }

    const response = await agent.answerQuestion(content)
    await message.reply(response.slice(0, 2000))
  } catch (error) {
    console.error('Message error:', error)
    await message.reply('Sorry, I had trouble processing that. Please try again!')
  }
}

// Handle new member joins
async function handleMemberJoin(member: any) {
  try {
    // Generate welcome message
    const welcomeMessage = await agent.welcomeMember(member.user.username)

    // Find welcome channel
    const welcomeChannel = member.guild.channels.cache.find(
      (ch: any) => ch.name.includes('welcome') || ch.name.includes('general')
    )

    if (welcomeChannel && welcomeChannel.type === ChannelType.GuildText) {
      await welcomeChannel.send(`${member} ${welcomeMessage}`)
    }
  } catch (error) {
    console.error('Welcome error:', error)
  }
}

// Main startup
async function main() {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                   GrepCoin Discord Bot                    ║
║              Powered by AI Community Agent                ║
╚═══════════════════════════════════════════════════════════╝
`)

  // Initialize AI agent
  console.log('Initializing AI agent...')
  agent = quickAgent('community', {
    provider: process.env.AI_PROVIDER as any || 'ollama',
    model: process.env.AI_MODEL
  }) as CommunityAgent

  // Register commands
  await registerCommands()

  // Event handlers
  client.once(Events.ClientReady, (c) => {
    console.log(`Logged in as ${c.user.tag}`)
    console.log(`Serving ${c.guilds.cache.size} servers`)
  })

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return
    await handleCommand(interaction)
  })

  client.on(Events.MessageCreate, handleMessage)
  client.on(Events.GuildMemberAdd, handleMemberJoin)

  // Login
  await client.login(DISCORD_TOKEN)
}

main().catch(console.error)
