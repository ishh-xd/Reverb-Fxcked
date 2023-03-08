const Command = require('../../structures/Command');
const db = require("../../schemas/announce");
const { ChannelType } = require("discord.js");
const { intReply } = require('../../handlers/functions');
const { EmbedBuilder } = require("discord.js")

module.exports = class Announce extends Command {
  constructor(client) {
    super(client, {
      name: 'announce',
      description: {
        content: "To enable/disable or to set the channel for the now playing message.",
        usage: "[sub_command]",
        examples: ["announce", "announce set #music logs", "announce prunning"],
      },
      voteReq: true,
      category: "settings",
      cooldown: 3,
      aliases: ["announcement"],
      permissions: {
        dev: false,
        client: ["SendMessages", "ViewChannel", "EmbedLinks"],
        user: ["ManageGuild"],
      },
      player: {
        voice: false,
        dj: false,
        active: false,
        djPerm: null,
      },
      options: [
        {
          name: "toggle",
          description: "To enable/disable the announcing of track start message.",
          type: 1,
          options: [
            {
              name: "input",
              description: "The inputTo the announcing.",
              type: 3,
              required: true,
              choices: [
                {
                  name: " Enable",
                  value: "enable",
                },
                {
                  name: " Disable",
                  value: "disable",
                }
              ]
            }
          ]
        },
        {
          name: "set",
          description: "To set the annouce channel of track start message.",
          type: 1,
          options: [
            {
              name: "channel",
              description: "The announcing channel.",
              type: 7,
              required: true
            }
          ]
        },
        {
          name: "reset",
          description: "To reset the announcing channel.",
          type: 1
        },
        {
          name: "prunning",
          description: "To enable/disable the prunning of track start message.",
          type: 1,
          options: [
            {
              name: "input",
              description: "The inputTo the announcing.",
              type: 3,
              required: true,
              choices: [
                {
                  name: " Enable",
                  value: "enable",
                },
                {
                  name: " Disable",
                  value: "disable",
                }
              ]
            }
          ]
        }
      ],
    })
  }
  async run(client, interaction) {
    let data = await db.findOne({ _id: interaction.guildId });
    if (!interaction.replied) await interaction.deferReply().catch(() => { });
    const subCommand = interaction.options.data[0].name;
    switch (subCommand) {
      case "toggle":
        const input = interaction.options.getString("input");
        if (input === "enable") {
          if (data) {
            const embed = new EmbedBuilder()
              .setColor(client.config.color)
              .setDescription(`The announcing of track start message is already enabled.`)
            if (data.mode === true) return intReply(interaction, ({ embeds: [embed] }));
            data.mode = true;
            data.lastUpdated = Math.round(Date.now() / 1000);
            data.moderator = interaction.user.id;
            await data.save();
            const embed1 = new EmbedBuilder()
              .setColor(client.config.color)
              .setDescription(`${client.config.emojis.success} Announcing of track start message is now **enabled**.`)
            return intReply(interaction, ({ embeds: [embed1] }));
          } else {
            data = new db({
              _id: interaction.guildId,
              mode: true,
              lastUpdated: Math.round(Date.now() / 1000),
              moderator: interaction.user.id,
            });
            await data.save();
            const embed3 = new EmbedBuilder()
              .setColor(client.config.color)
              .setDescription(`${client.config.emojis.success} Announcing of track start message is now **enabled**.`)
            return intReply(interaction, ({ embeds: [embed3] }));
          }
        } else if (input === "disable") {
          if (data) {
            const embed4 = new EmbedBuilder()
              .setColor(client.config.color)
              .setDescription(`The announcing is already disabled.`)
            if (data.mode === false) return intReply(interaction, ({ embeds: [embed4] }));
            data.mode = false;
            data.lastUpdated = Math.round(Date.now() / 1000);
            data.moderator = interaction.user.id;
            await data.save();
            const embed5 = new EmbedBuilder()
              .setColor(client.config.color)
              .setDescription(`${client.config.emojis.success} Announcing of track start message is now **disabled**.`)
            await intReply(interaction, ({ embeds: [embed5] }));
            const embed6 = new EmbedBuilder()
              .setColor(client.config.color)
              .setDescription(`${client.config.emojis.error} No data found for this server.`)
          } else return intReply(interaction, ({ embeds: [embed6] }));

        }
        break;
      case "set":
        const channel = interaction.guild.channels.cache.get(interaction.options.getChannel("channel").id);
        const embed7 = new EmbedBuilder()
          .setColor(client.config.color)
          .setDescription(`I was unable to find the given channel.`)
        if (!channel) return intReply(interaction, ({ embeds: [embed7] }));
        const embed8 = new EmbedBuilder()
          .setColor(client.config.color)
          .setDescription(`${client.config.emojis.error} You've provided an invalid channel, please provide a text based channel.`)
        if (channel.type !== ChannelType.GuildText) return intReply(interaction, ({ embeds: [embed8] }));
        if (data) {
          const embed9 = new EmbedBuilder()
            .setColor(client.config.color)
            .setDescription(`This channel was already set by <@${data.moderator}> on <t:${data.lastUpdated}>`)
          if (data.channel === channel.id) return intReply(interaction, ({ embeds: [embed9] }));

          data.mode = true;
          data.channel = channel.id;
          data.moderator = interaction.user.id;
          data.lastUpdated = Math.round(Date.now() / 1000);
          await data.save();
          const embed10 = new EmbedBuilder()
            .setColor(client.config.color)
            .setDescription(`${client.config.emojis.success} The announcing channel has been set to ${channel} by <@${interaction.user.id}> on <t:${Math.round(Date.now() / 1000)}>`)
          await intReply(interaction, ({ embeds: [embed10] }));

        } else {
          data = new db({
            _id: interaction.guildId,
            mode: true,
            channel: channel.id,
            moderator: interaction.user.id,
            lastUpdated: Math.round(Date.now() / 1000)
          });

          await data.save();
          const embed11 = new EmbedBuilder()
            .setColor(client.config.color)
            .setDescription(`${client.config.emojis.success} The announcing channel has been set to ${channel} by <@${interaction.user.id}> on <t:${Math.round(Date.now() / 1000)}>`)
          await intReply(interaction, ({ embeds: [embed11] }));
        }
        break;
      case "reset":
        const embed12 = new EmbedBuilder()
          .setColor(client.config.color)
          .setDescription(`The announcing is already disabled.`)
        if (!data) return intReply(interaction, ({ embeds: [embed12] }));
        await data.delete();
        const embed13 = new EmbedBuilder()
          .setColor(client.config.color)
          .setDescription(`${client.config.emojis.success} The announcing channel has been reset.`)
        await intReply(interaction, ({ embeds: [embed13] }));
        break;
      case "prunning":
        const input2 = interaction.options.getString("input");
        if (input2 === "enable") {
          if (data) {
            const embed14 = new EmbedBuilder()
              .setColor(client.config.color)
              .setDescription(`Prunning is already enabled.`)
            if (data.prunning === true) return intReply(interaction, ({ embeds: [embed14] }));

            data.prunning = true;
            data.lastUpdated = Math.round(Date.now() / 1000);
            data.moderator = interaction.user.id;
            await data.save();
            const embed15 = new EmbedBuilder()
              .setColor(client.config.color)
              .setDescription(`${client.config.emojis.success} Prunning of track start message is now **enabled**.`)
            return intReply(interaction, ({ embeds: [embed15] }));
          } else {
            data = new db({
              _id: interaction.guildId,
              prunning: true,
              moderator: interaction.user.id,
              lastUpdated: Math.round(Date.now() / 1000)
            });
            await data.save();
            const embed16 = new EmbedBuilder()
              .setColor(client.config.color)
              .setDescription(`${client.config.emojis.success} Prunning of track start message is now **enabled**.`)
            await intReply(interaction, ({ embeds: [embed16] }));
          }
        } else if (input2 === 'disabled') {
          if (data.prunning) {
            const embed17 = new EmbedBuilder()
              .setColor(client.config.color)
              .setDescription(`Prunning is already disabled.`)
            if (data.prunning === false) return intReply(interaction, ({ embeds: [embed17] }));
            data.prunning = false;
            data.lastUpdated = Math.round(Date.now() / 1000);
            data.moderator = interaction.user.id;
            await data.save();
            const embed18 = new EmbedBuilder()
              .setColor(client.config.color)
              .setDescription(`${client.config.emojis.success} The prunning of track start message is now **disabled**.`)
            return intReply(interaction, ({ embeds: [embed18] }));
          }
        }
    }
  }
}