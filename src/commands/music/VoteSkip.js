const Command = require('../../structures/Command');
const { intReply, autoplay } = require("../../handlers/functions");
const { convertTime } = require('../../utils/convert');
const db = require("../../schemas/247");
const { ActionRowBuilder } = require("discord.js");

module.exports = class VoteSkip extends Command {
  constructor(client) {
    super(client, {
      name: 'voteskip',
      description: {
        content: 'To vote to skip the current song.',
        usage: 'voteskip',
        examples: ['voteskip']
      },
      voteReq: true,
      category: 'music',
      cooldown: 3,
      player: {
        voice: true,
        dj: false,
        active: true,
        djPerm: ['DeafenMembers'],
      },
      permissions: {
        dev: true,
        client: ["SendMessages", "ViewChannel", "EmbedLinks", "Connect", "Speak"],
        user: [],
      },
      options: [
        {
          name: "min_votes",
          description: "The minimum votes required to skip.",
          type: 10,
          required: false
        },

        {
          name: "max_votes",
          description: "The maximum votes required to skip.",
          type: 10,
          required: false
        },

        {
          name: "time",
          description: "The time required for voting.",
          type: 3,
          required: false,
          choices: [
            {
              name: "30s",
              value: "30s"
            },

            {
              name: "60s",
              value: "60s"
            },

            {
              name: "2m",
              value: "2m"
            },

            {
              name: "3m",
              value: "3m"
            },

            {
              name: "5m",
              value: "5m"
            }
          ]
        }
      ],

    });
  }

  async run(client, interaction) {
    if (!interaction.replied) await interaction.deferReply().catch(() => { });
    const color = client.config.color;
    let player = client.player.players.get(interaction.guildId);

    if (player && player.state !== 1) {
      player.destroy();
      return await intReply(interaction, `Nothing is playing right now.`, color);
    };

    if (!player.queue.length) return await intReply(interaction, `There are no more songs in the queue to vote for.`, color);

    if (interaction.guild.members.me.voice.channel && interaction.member.voice.channelId !== interaction.guild.members.me.voice.channelId) return await intReply(interaction, `You are to connected to ${interaction.guild.members.me.voice.channel} to use this command.`, color);

    if (interaction.guild.members.me.voice.channel.members.size <= 2) return await intReply(interaction, `Not enough participants to complete this voting.`, color);

    let min_votes = interaction.options.getNumber("min_votes");
    let max_votes = interaction.options.getNumber("max_votes");

    if (!min_votes) min_votes = Math.round(interaction.guild.members.me.voice.channel.members.size - 1 / 2);
    if (!max_votes) max_votes = Math.round(interaction.guild.members.me.voice.channel.members.size - 1 / 2);
    if (min_votes <= 0) min_votes = Math.round(interaction.guild.members.me.voice.channel.members.size - 1 / 2);
    if (min_votes >= max_votes) min_votes = max_votes;
    if (min_votes > interaction.guild.members.me.voice.channel.members.size) min_votes = Math.round(interaction.guild.members.me.voice.channel.members.size - 1 / 2);
    if (max_votes > interaction.guild.members.me.voice.channel.members.size) max_votes = interaction.guild.members.me.voice.channel.members.size - 1;
    if (max_votes <= 0) max_votes = Math.round(interaction.guild.members.me.voice.channel.members.size - 1 / 2);

    let time = interaction.options.getString("time");
    if (!time) time = 60000;
    switch (time) {
      case "30s":
        time = 30000;
        break;

      case "60s":
        time = 60000;
        break;

      case "2m":
        time = 60000 * 2;
        break;

      case "3m":
        time = 60000 * 3;
        break;

      case "5m":
        time = 60000 * 5;
        break;
    };

    let buttonE = client.button().setCustomId(`vote_skip_but_${interaction.guildId}`).setLabel("Vote").setStyle(1);

    let embed1 = client.embed().setColor(color).setDescription(`A vote skip is being conducted by <@${interaction.user.id}>.`).setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) }).setTitle(`Vote Skip`).setFooter({ text: `This vote skipping will end in ${convertTime(Number(time))}` }).addFields(
      { name: `Minimum Votes Required`, value: `**${min_votes}**`, inline: true },
      { name: `Maximum Votes`, value: `**${max_votes}**`, inline: true },
      { name: `Votes Count`, value: `**0**`, inline: true }
    )

    await interaction.editReply({
      embeds: [embed1],
      components: [new ActionRowBuilder().addComponents(buttonE)]
    }).catch(() => { });

    const collector = interaction.channel.createMessageComponentCollector({
      filter: (b) => {
        if (b.member.voice.channel && b.member.voice.channelId === interaction.guild.members.me.voice.channelId && b.customId === buttonE.customId) return true;
        else {
          b.deferUpdate().catch(() => { });
          return false;
        };
      },
      time: time
    });

    const votersList = [];

    collector.on("end", async () => {
      if (interaction) await interaction.editReply({
        components: [new ActionRowBuilder().addComponents(buttonE.setDisabled(true))]
      }).catch(() => { });

      if (votersList.length >= max_votes) return;
      if (votersList.length >= min_votes) {
        if (!player) return await interaction.followUp({
          embeds: [client.embed().setColor(color).setDescription(`Due to the player not being found, the vote skipping has been cancelled.`)]
        }).catch(() => { });

        if (!player.queue) return await interaction.followUp({
          embeds: [client.embed().setColor(color).setDescription(`Due to the player not being found, the vote skipping has been cancelled.`)]
        }).catch(() => { });

        if (!player.queue.current) return await interaction.followUp({
          embeds: [client.embed().setColor(color).setDescription(`The vote skipping has been cancelled since nothing is currently playing.`)]
        }).catch(() => { });

        const track = player.queue.current;

        if (!player.queue.length) {
          let data = await db.findOne({ _id: interaction.guildId });
          if (player.get("autoplay")) {
            let au = await autoplay(player, client.user);
            if (au === "failed") {
              if (data && data.mode) {
                player.shoukaku.stopTrack();
                await interaction.followUp({ embeds: [client.embed().setColor(color).setDescription(`Vote Skipped [${track.title}](${track.uri})`)] }).catch(() => { });
              } else {
                player.destroy();
                await interaction.followUp({ embeds: [client.embed().setColor(color).setDescription(`Vote Skipped [${track.title}](${track.uri}) and destroyed the player since there were no more songs left in the queue.`)] }).catch(() => { });
              };
            } else {
              player.shoukaku.stopTrack();
              await interaction.followUp({ embeds: [client.embed().setColor(color).setDescription(`Vote Skipped [${track.title}](${track.uri})`)] })
            };
          } else {
            if (data && data.mode) {
              player.shoukaku.stopTrack();
              await interaction.followUp({ embeds: [client.embed().setColor(color).setDescription(`Vote Skipped [${track.title}](${track.uri})`)] }).catch(() => { });
            } else {
              player.destroy();
              await interaction.followUp({ embeds: [client.embed().setColor(color).setDescription(`Vote Skipped [${track.title}](${track.uri}) and destroyed the player since there were no more songs left in the queue.`)] }).catch(() => { });
            };
          };
        } else {
          player.shoukaku.stopTrack();
          await interaction.followUp({ embeds: [client.embed().setColor(color).setDescription(`Vote Skipped [${track.title}](${track.uri})`, color)] }).catch(() => { });
        };
      };
    });

    collector.on("collect", async (button) => {
      if (!button.replied) await button.deferUpdate().catch(() => { });

      if (votersList.find((x) => x === button.user.id)) return;
      votersList.push(button.user.id);

      await interaction.editReply({
        embeds: [embed1.addFields({ name: "Voters", value: `${votersList.map((x) => `<@${x}>`).join(", ")}`, inline: true })],
      }).catch(() => { });

      if (votersList.length >= max_votes) {
        if (!player) return await interaction.followUp({
          embeds: [client.embed().setColor(color).setDescription(`Due to the player not being found, the vote skipping has been cancelled.`)]
        }).catch(() => { });

        if (!player.queue) return await interaction.followUp({
          embeds: [client.embed().setColor(color).setDescription(`Due to the player not being found, the vote skipping has been cancelled.`)]
        }).catch(() => { });

        if (!player.queue.current) return await interaction.followUp({
          embeds: [client.embed().setColor(color).setDescription(`The vote skipping has been cancelled since nothing is currently playing.`)]
        }).catch(() => { });

        const track = player.queue.current;

        if (!player.queue.length) {
          let data = await db.findOne({ _id: interaction.guildId });
          if (player.get("autoplay")) {
            let au = await autoplay(player, client.user);
            if (au === "failed") {
              if (data && data.mode) {
                player.shoukaku.stopTrack();
                await interaction.followUp({ embeds: [client.embed().setColor(color).setDescription(`Vote Skipped [${track.title}](${track.uri})`)] }).catch(() => { });
              } else {
                player.destroy();
                await interaction.followUp({ embeds: [client.embed().setColor(color).setDescription(`Vote Skipped [${track.title}**](${track.uri}) and destroyed the player since there were no more songs left in the queue.`)] }).catch(() => { });
              };
            } else {
              player.shoukaku.stopTrack();
              await interaction.followUp({ embeds: [client.embed().setColor(color).setDescription(`Vote Skipped [${track.title}](${track.uri})`)] })
            };
          } else {
            if (data && data.mode) {
              player.shoukaku.stopTrack();
              await interaction.followUp({ embeds: [client.embed().setColor(color).setDescription(`Vote Skipped [${track.title}](${track.uri})`)] }).catch(() => { });
            } else {
              player.destroy();
              await interaction.followUp({ embeds: [client.embed().setColor(color).setDescription(`Vote Skipped [${track.title}](${track.uri}) and destroyed the player since there were no more songs left in the queue.`)] }).catch(() => { });
            };
          };
        } else {
          player.shoukaku.stopTrack();
          await interaction.followUp({ embeds: [client.embed().setColor(color).setDescription(`Vote Skipped [${track.title}](${track.uri})`, color)] }).catch(() => { });
        };

        return collector.stop();
      };
    });
  }
}