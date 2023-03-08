const Command = require('../../structures/Command');
const { PermissionsBitField, ActionRowBuilder } = require('discord.js');
const { convertHmsToMs, NumberToBNH } = require("../../utils/convert");

module.exports = class Uptime extends Command {
  constructor(client) {
    super(client, {
      name: 'uptime',
      description: {
        content: "Shows the uptime of the bot.",
        usage: '',
        examples: ['invite']
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

    const embed1 = client.embed().setColor(client.config.color).setDescription(`${convertHmsToMs(client.uptime)}`);


    return interaction.reply({ embeds: [embed1] });
  }
}

