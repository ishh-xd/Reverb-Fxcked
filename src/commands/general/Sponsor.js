const Command = require('../../structures/Command');
const { PermissionsBitField, ActionRowBuilder } = require('discord.js');

module.exports = class Sponsor extends Command {
  constructor(client) {
    super(client, {
      name: 'sponsor',
      description: {
        content: "Returns the sponsor's information.",
        usage: '',
        examples: ['sponsor']
      },
      category: 'info',
      cooldown: 3,
      permissions: {
        dev: false,
        client: [PermissionsBitField.SendMessages, PermissionsBitField.ViewChannel, PermissionsBitField.EmbedLinks],
        user: [],
      },
      player: {
        voice: false,
        dj: false,
        active: false,
        djPerm: null,
      },
    });
  }

  async run(client, interaction) {

    const embed1 = client.embed().setColor(client.config.color).setTitle(`🚀 Galaxichost | Free 24/7 Hosting`).setDescription(`Looking to play Minecraft with your friends, but can't pay for it? We got you, Start using [Galaxichost](https://galaxichost.com/) right now.

    at [GalaxicHost](https://galaxichost.com/) we support:
    💎  Free MineCraft Hosting
    💎  Free FiveM Hosting
    💎  Free Discord Bot Hosting
    💎  24/7 
    💎  Good Support
    💎  99.9% Uptime
    💎  Pterodactyl Panel
    💎  Full Control of your server
    💎  Unlimited Slots
    💎  Earning by afking or using the bot!
    
    Locations:
    
    🇳🇱  Netherlands
    🇮🇳  India [Soon]
    🇩🇪 Germany [Soon]`);

    const inv = client.button().setLabel("GalaxicHost").setURL(`https://galaxichost.com/`).setStyle(5);

    return interaction.reply({ embeds: [embed1], components: [new ActionRowBuilder().addComponents(inv)] });
  }
}

