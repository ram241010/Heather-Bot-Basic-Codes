module.exports = {
  handleEvents(client) {
    client.on('interactionCreate', async interaction => {
      if (!interaction.isCommand()) return;
      
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        await interaction.reply({ 
          content: '❌ Command failed!', 
          ephemeral: true 
        });
      }
    });

    client.on('ready', () => {
      console.log(`Logged in as ${client.user.tag}`);
    });
  }
};
