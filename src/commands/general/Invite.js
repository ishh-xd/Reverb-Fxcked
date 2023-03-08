const Command = require('../../structures/Command');
const { PermissionsBitField, ActionRowBuilder } = require('discord.js');

module.exports = class Invite extends Command {
  constructor(client) {
    super(client, {
      name: 'invite',
      description: {
        content: "Returns the invite link of the bot.",
        usage: 'invite',
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

    const embed1 = client.embed().setColor(client.config.color).setDescription(`Invite Reverb by clicking [here](${client.config.links.invite}) or on the button below.`);

    const inv = client.button().setLabel("Invite").setURL(client.config.links.invite).setStyle(5);

    return interaction.reply({ embeds: [embed1], components: [new ActionRowBuilder().addComponents(inv)] });
  }
}

