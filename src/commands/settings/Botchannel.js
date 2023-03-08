const Command = require('../../structures/Command');
const { CommandInteraction, ButtonBuilder, ActionRowBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const db = require("../../schemas/guilds");

module.exports = class Setup extends Command {
  constructor(client) {
    super(client, {
      name: 'botchannel',
      description: {
        content: 'To set the bot channel.',
        usage: '<sub commands>',
        examples: ['setup', 'setup change #song-request', 'setup delete', 'setup info']
      },
      cooldown: 5,
      category: 'settings',
      permissions: {
        dev: false,
        client: ["SendMessages", "ViewChannel", "EmbedLinks", "ManageChannels"],
        user: ['ManageGuild'],
      },
      voteReq: true,
      options: [
        {
          name: "set",
          description: "Let's you set or change the bot channel of your server",
          type: 1,
          options: [
            {
              name: "channel",
              description: "Which channel should the bot channel be?",
              type: 7,
              channelTypes: ["GUILD_TEXT"],
              required: true,
            },
          ],
        },
        {
          name: "reset",
          description: "Resets the bot channel of your server",
          type: 1,
        },
      ],

    });
  }
  /**
   * 
   * @param {import('../../index').Client} client 
   * @param {CommandInteraction} interaction 
   * @returns 
   */
  async run(client, interaction, color) {
    let guildData = await db.findOne({ _id: interaction.guildId });
    console.log(guildData)
    let subcommand = interaction.options.getSubcommand();
    if (subcommand === "set") {
      let channel = interaction.options.getChannel("channel");
      if (guildData.botChannel === channel.id) {
        return interaction.reply({
          ephemeral: true,
          embeds: [
            new EmbedBuilder()
              .setColor(color)
              .setDescription(
                `Text channel is already set to ${channel}`
              ),
          ],
        });
      }
      guildData.botChannel = channel.id;
      guildData.save();
      return interaction.reply({
        ephemeral: false,
        embeds: [
          new EmbedBuilder()
            .setColor(color)
            .setDescription(
              `Successfully set the text channel to ${channel}`
            ),
        ],
      });
    } else if (subcommand === "reset") {
      if (!guildData.botChannel) {
        return interaction.reply({
          ephemeral: true,
          embeds: [
            new EmbedBuilder()
              .setColor(color)
              .setDescription(
                `Unable to find any text channel for this server!`
              ),
          ],
        });
      }
      guildData.delete();
      return interaction.reply({
        ephemeral: false,
        embeds: [
          new EmbedBuilder()
            .setColor(color)
            .setDescription(
              `Successfully reset the text channel!`
            ),
        ],
      });
    }
  }
};