const Command = require('../../structures/Command');
const { PermissionsBitField, ActionRowBuilder } = require('discord.js');

module.exports = class Support extends Command {
  constructor(client) {
    super(client, {
      name: 'support',
      description: {
        content: "Returns the support server link.",
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

    const embed1 = client.embed().setColor(client.config.color).setDescription(`Join the support server by clicking [here](${client.config.links.server}) or on the button below.`);

    const inv = client.button().setLabel("Support Server").setURL(client.config.links.server).setStyle(5);

    return interaction.reply({ embeds: [embed1], components: [new ActionRowBuilder().addComponents(inv)] });
  }
}

