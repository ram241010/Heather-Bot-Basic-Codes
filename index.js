require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const { commands } = require('./commands');
const { handleEvents } = require('./event'); // This line is fixed

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ]
});

// ======================
// 🚀 COMMAND REGISTRATION
// ======================
async function registerCommands() {
  try {
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    
    console.log('🔸 Registering slash commands...');
    
    const commandData = commands.map(command => command.data.toJSON());
    
    // Global registration (takes up to 1 hour to propagate)
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commandData }
    );
    
    console.log('✅ Successfully registered ALL commands globally!');
  } catch (error) {
    console.error('❌ Failed to register commands:', error);
  }
}

// ======================
// 🤖 BOT INITIALIZATION
// ======================
client.once('ready', async () => {
  console.log(`🔥 ${client.user.tag} is online!`);
  
  // Set custom status
  client.user.setPresence({
    activities: [{ name: 'Silent Hill', type: 3 }], // WATCHING
    status: 'online'
  });
  
  // Register commands on startup
  await registerCommands();
});

// ======================
// ⚙️ CORE FUNCTIONALITY
// ======================
// Load commands
client.commands = new Map();
commands.forEach(cmd => client.commands.set(cmd.data.name, cmd));

// Handle events
handleEvents(client); // This should now work

// Command interaction handler
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error executing /${interaction.commandName}:`, error);
    
    // Emergency response if original reply fails
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: '❌ An error occurred while executing this command!',
        ephemeral: true
      });
    } else {
      await interaction.followUp({
        content: '❌ Command execution failed!',
        ephemeral: true
      });
    }
  }
});

// ======================
// 🚨 ERROR HANDLING
// ======================
process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', error => {
  console.error('Uncaught exception:', error);
});

// ======================
// 🔐 LOGIN
// ======================
client.login(process.env.TOKEN)
  .catch(error => {
    console.error('FATAL: Failed to log in:', error);
    process.exit(1);
  });
