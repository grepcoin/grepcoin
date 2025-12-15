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
import { ActivityPoller } from './services/activity-poller'
import { GuardianMonitor } from './services/guardian-monitor'
import { createStatsEmbed, createHealthEmbed, createAlertEmbed } from './embeds'

// Configuration
const DISCORD_TOKEN = process.env.DISCORD_TOKEN!
const CLIENT_ID = process.env.DISCORD_CLIENT_ID!
const GUILD_ID = process.env.DISCORD_GUILD_ID // Optional: for development

// Channel IDs for live updates
const ACTIVITY_CHANNEL_ID = process.env.DISCORD_ACTIVITY_CHANNEL_ID
const HIGHLIGHTS_CHANNEL_ID = process.env.DISCORD_HIGHLIGHTS_CHANNEL_ID
const MONITORING_CHANNEL_ID = process.env.DISCORD_MONITORING_CHANNEL_ID

// Web App URL for activity polling
const WEB_APP_URL = process.env.WEB_APP_URL || 'http://localhost:3000'

// Monitoring intervals
const ACTIVITY_POLL_INTERVAL = parseInt(process.env.ACTIVITY_POLL_INTERVAL || '30000')
const HEALTH_CHECK_INTERVAL = parseInt(process.env.HEALTH_CHECK_INTERVAL || '300000')

// Channels where the bot responds to all messages
const AUTO_RESPONSE_CHANNELS = ['support', 'help', 'questions', 'ask-grepbot']

// Initialize Discord client
// Note: MessageContent and GuildMembers are privileged intents
// Enable them in Discord Developer Portal > Bot > Privileged Gateway Intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    // Uncomment after enabling in Developer Portal:
    // GatewayIntentBits.MessageContent,
    // GatewayIntentBits.GuildMembers
  ]
})

// Initialize services
let agent: CommunityAgent
let activityPoller: ActivityPoller
let guardianMonitor: GuardianMonitor

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
    .setDescription('Get useful GrepCoin links'),

  // New commands for monitoring
  new SlashCommandBuilder()
    .setName('status')
    .setDescription('Get current GrepCoin contract status'),

  new SlashCommandBuilder()
    .setName('alerts')
    .setDescription('View recent security alerts')
    .addStringOption(option =>
      option.setName('severity')
        .setDescription('Filter by severity')
        .setRequired(false)
        .addChoices(
          { name: 'All', value: 'all' },
          { name: 'Critical', value: 'critical' },
          { name: 'High', value: 'high' },
          { name: 'Medium', value: 'medium' },
          { name: 'Low', value: 'low' }
        )
    ),

  new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Get GrepCoin platform statistics'),
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
    switch (interaction.commandName) {
      case 'ask': {
        const question = interaction.options.getString('question', true)
        const response = await agent.answerQuestion(question)
        await interaction.editReply(response.slice(0, 2000))
        break
      }

      case 'games': {
        const game = interaction.options.getString('game')
        let response: string
        if (game) {
          response = await agent.chat(`Tell me about the ${game} game in GrepCoin.`)
        } else {
          response = await agent.chat('List all 8 games in GrepCoin with brief descriptions.')
        }
        await interaction.editReply(response.slice(0, 2000))
        break
      }

      case 'staking': {
        const tier = interaction.options.getString('tier')
        let response: string
        if (tier) {
          response = await agent.chat(`Explain the ${tier} staking tier in GrepCoin.`)
        } else {
          response = await agent.chat('Explain all 5 staking tiers in GrepCoin with their benefits.')
        }
        await interaction.editReply(response.slice(0, 2000))
        break
      }

      case 'help': {
        const response = `**GrepBot Help**

I'm GrepBot, your AI assistant for GrepCoin! Here's what I can help with:

**Commands:**
• \`/ask <question>\` - Ask me anything about GrepCoin
• \`/games [game]\` - Get info about our arcade games
• \`/staking [tier]\` - Learn about staking and rewards
• \`/status\` - Check contract health status
• \`/alerts [severity]\` - View security alerts
• \`/stats\` - Get platform statistics
• \`/links\` - Get useful links

**Quick Topics:**
• How to play and earn GREP
• Staking tiers and multipliers
• Wallet setup
• Token information

Just ask in the support channels and I'll help!`
        await interaction.editReply(response)
        break
      }

      case 'links': {
        const response = `**GrepCoin Links**

🎮 **Play Games:** https://grepcoin.io/games
💰 **Fundraise:** https://grepcoin.io/fundraise
📖 **Docs:** https://grepcoin.io/docs
🐙 **GitHub:** https://github.com/grepcoin/grepcoin
🐦 **Twitter:** https://twitter.com/grepcoin

📜 **Legal:**
• Terms: https://grepcoin.io/terms
• Privacy: https://grepcoin.io/privacy
• Disclaimer: https://grepcoin.io/disclaimer`
        await interaction.editReply(response)
        break
      }

      case 'status': {
        // Run a manual health check
        const metrics = await guardianMonitor.manualHealthCheck()
        const embed = createHealthEmbed(metrics)
        await interaction.editReply({ embeds: [embed] })
        break
      }

      case 'alerts': {
        const severity = interaction.options.getString('severity')
        const alerts = guardianMonitor.getAlerts(
          severity && severity !== 'all' ? severity as any : undefined
        )

        if (alerts.length === 0) {
          await interaction.editReply('No alerts found. All systems are operating normally.')
        } else {
          // Show up to 5 most recent alerts
          const recentAlerts = alerts.slice(-5).reverse()
          const embeds = recentAlerts.map(alert => createAlertEmbed(alert))
          await interaction.editReply({
            content: `Showing ${recentAlerts.length} of ${alerts.length} alerts:`,
            embeds
          })
        }
        break
      }

      case 'stats': {
        // Fetch stats from web app
        try {
          const response = await fetch(`${WEB_APP_URL}/api/stats`)
          if (response.ok) {
            const stats = await response.json()
            const embed = createStatsEmbed({
              totalPlayers: stats.totalPlayers || 0,
              totalGrepEarned: stats.totalGrepEarned || 0,
              totalGamesPlayed: stats.totalGamesPlayed || 0,
              activeGames: stats.activeGames || 8,
              todayGames: stats.todayGames || 0,
              todayGrep: stats.todayGrep || 0,
            })
            await interaction.editReply({ embeds: [embed] })
          } else {
            await interaction.editReply('Unable to fetch platform statistics. Please try again later.')
          }
        } catch (error) {
          console.error('Stats fetch error:', error)
          await interaction.editReply('Unable to fetch platform statistics. Please try again later.')
        }
        break
      }

      default:
        await interaction.editReply("I don't recognize that command. Try `/help` for available commands.")
    }
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

  // Initialize services
  console.log('Initializing services...')

  activityPoller = new ActivityPoller(client, {
    activityChannelId: ACTIVITY_CHANNEL_ID,
    highlightsChannelId: HIGHLIGHTS_CHANNEL_ID,
    webAppUrl: WEB_APP_URL,
    pollInterval: ACTIVITY_POLL_INTERVAL,
  })

  guardianMonitor = new GuardianMonitor(client, {
    monitoringChannelId: MONITORING_CHANNEL_ID,
    healthCheckInterval: HEALTH_CHECK_INTERVAL,
    aiProvider: process.env.AI_PROVIDER as any || 'ollama',
    aiModel: process.env.AI_MODEL,
  })

  // Register commands
  await registerCommands()

  // Event handlers
  client.once(Events.ClientReady, async (c) => {
    console.log(`Logged in as ${c.user.tag}`)
    console.log(`Serving ${c.guilds.cache.size} servers`)

    // Start services after bot is ready
    console.log('Starting live update services...')
    await activityPoller.start()
    await guardianMonitor.start()

    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                    Bot is fully ready!                    ║
╠═══════════════════════════════════════════════════════════╣
║  Activity Channel: ${(ACTIVITY_CHANNEL_ID || 'Not configured').padEnd(36)}║
║  Highlights Channel: ${(HIGHLIGHTS_CHANNEL_ID || 'Not configured').padEnd(34)}║
║  Monitoring Channel: ${(MONITORING_CHANNEL_ID || 'Not configured').padEnd(34)}║
╚═══════════════════════════════════════════════════════════╝
`)
  })

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return
    await handleCommand(interaction)
  })

  client.on(Events.MessageCreate, handleMessage)
  client.on(Events.GuildMemberAdd, handleMemberJoin)

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nShutting down...')
    activityPoller.stop()
    guardianMonitor.stop()
    client.destroy()
    process.exit(0)
  })

  // Login
  await client.login(DISCORD_TOKEN)
}

main().catch(console.error)
