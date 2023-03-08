const Command = require('../../structures/Command');
const { CommandInteraction, ButtonBuilder, ActionRowBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const db = require("../../schemas/setup");
const { readdirSync } = require('node:fs')

module.exports = class Setup extends Command {
  constructor(client) {
    super(client, {
      name: 'setup',
      description: {
        content: 'To set the song request channel.',
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
          name: 'create',
          description: "To start the configuration of song request channel.",
          type: 1,
        },
        {
          name: 'change',
          description: "To change the song request channel.",
          type: 1,
          options: [
            {
              name: 'channel',
              description: "The channel that you want to change.",
              type: 7,
              required: true,
            }
          ]
        },
        {
          name: 'delete',
          description: "To delete the song request channel.",
          type: 1,
        },
        {
          name: 'info',
          description: "To get the information of the song request channel.",
          type: 1,
        }
      ],

    });
  }
  /**
   * 
   * @param {import('../../index').Client} client 
   * @param {CommandInteraction} interaction 
   * @returns 
   */
  async run(client, interaction) {

    let player = client.player.players.get(interaction.guildId);
    let data = await db.findOne({ _id: interaction.guildId });

    const imgs = readdirSync("./src/assets/images/").filter(c => c.split('.').pop() === 'png');

    let img = imgs[Math.floor(Math.random() * imgs.length)];

    let file = new AttachmentBuilder(`./src/assets/images/${img}`, `${img}`).setName(`Reverb banner.png`)

    const color = client.config.color;
    const title = player && player.queue && player.queue.current ? `Now playing` : "**Join a voice channel and queue songs by name/url.**";
    const desc = player && player.queue && player.queue.current ? `[**__${player.queue.current.title}__**](${player.queue.current.uri})` : null;
    const footer = {
      name: player && player.queue && player.queue.current ? `Requested by ${player.queue.current.requester.username}` : "Thank you for using " + client.user.username,
      url: player && player.queue && player.queue.current ? `${player.queue.current.requester.displayAvatarURL({})}` : `${client.user.displayAvatarURL({})}`
    };
    const image = player && player.queue && player.queue.current ? player.queue.current.displayThumbnail("maxresdefault") : client.config.links.image;

    let embed1 = new EmbedBuilder().setColor(color).setTitle(title).setFooter({ text: footer.name, iconURL: footer.url }).setImage(image);

    if (player && player.queue && player.queue.current) embed1.setDescription(desc);

    let pausebut = new ButtonBuilder().setCustomId(`SETUP_PLAY_PAUSE_BUTTON`).setStyle(2).setEmoji(client.config.bemoji.pause)

    let lowvolumebut = new ButtonBuilder().setCustomId(`SETUP_VOL_DOWN_BUTTON`).setEmoji(`${client.config.bemoji.voldown}`).setStyle(2);

    let highvolumebut = new ButtonBuilder().setCustomId(`SETUP_VOL_UP_BUTTON`).setEmoji(`${client.config.bemoji.volup}`).setStyle(2);

    let previousbut = new ButtonBuilder().setCustomId(`SETUP_PREVIOUS_BUTTON`).setEmoji(`${client.config.bemoji.previous}`).setStyle(2);

    let skipbut = new ButtonBuilder().setCustomId(`SETUP_SKIP_BUTTON`).setEmoji(`${client.config.bemoji.next}`).setStyle(2);

    let rewindbut = new ButtonBuilder().setCustomId(`REWIND_BUTTON`).setEmoji(`${client.config.bemoji.rewind}`).setStyle(2);

    let forwardbut = new ButtonBuilder().setCustomId(`FORWARD_BUTTON`).setEmoji(`${client.config.bemoji.forward}`).setStyle(2);

    let toggleautoplaybut = new ButtonBuilder().setCustomId(`AUTO_PLAY_BUTTON`).setEmoji(`${client.config.bemoji.infinity}`).setStyle(2);

    let loopmodesbut = new ButtonBuilder().setCustomId(`LOOP_MODE_BUTTON`).setEmoji(`${client.config.bemoji.loop}`).setStyle(2);

    let stopbut = new ButtonBuilder().setCustomId(`SETUP_STOP_BUTTON`).setEmoji(`${client.config.bemoji.stop}`).setStyle(2);

    const row1 = new ActionRowBuilder().addComponents(lowvolumebut, previousbut, pausebut, skipbut, highvolumebut);

    const row2 = new ActionRowBuilder().addComponents(rewindbut, toggleautoplaybut, stopbut, loopmodesbut, forwardbut);
    const subCommand = interaction.options.data[0].name;
    if (!interaction.replied) await interaction.deferReply().catch(() => { });

    switch (subCommand) {
      case 'create':
        if (data) {
          const embed10 = new EmbedBuilder()
            .setColor(client.config.color)
            .setDescription(`The song request channel is already set to <#${data.channel}>`)
          return await interaction.editReply(({ embeds: [embed10] }));
        }
        const parent = await interaction.guild.channels.create({
          name: `${client.user.username}'s Music Zone`,
          type: 4,
          permissionOverwrites: [
            {
              type: "member",
              id: client.user.id,
              allow: ["Connect", "Speak", "ViewChannel", "SendMessages", "EmbedLinks"]
            },
            {
              type: "role",
              id: interaction.guild.roles.everyone.id,
              allow: ["ViewChannel"],
              deny: ["UseApplicationCommands"]
            }
          ]
        });
        const textChannel = await interaction.guild.channels.create({
          name: `${client.user.username}-song-requests`,
          type: 0,
          parent: parent.id,
          topic: client.config.setup.channel.topic,
          permissionOverwrites: [
            {
              type: "member",
              id: client.user.id,
              allow: ["ViewChannel", "SendMessages", "EmbedLinks", "ReadMessageHistory"],
              deny: ["UseApplicationCommands"]
            },
            {
              type: "role",
              id: interaction.guild.roles.everyone.id,
              allow: ["ViewChannel", "SendMessages", "EmbedLinks", "ReadMessageHistory"],
              deny: ["UseApplicationCommands"]

            }
          ]
        });
        let rates = [1000 * 64, 1000 * 96, 1000 * 128, 1000 * 256, 1000 * 384];
        let rate = rates[0];

        switch (interaction.guild.premiumTier) {
          case 0:
            rate = rates[1];
            break;

          case 1:
            rate = rates[2];
            break;

          case 2:
            rate = rates[3];
            break;

          case 3:
            rate = rates[4];
            break;
        };
        const voiceChannel = await interaction.guild.channels.create({
          name: `${client.user.username} Music`,
          type: 2,
          parent: parent.id,
          bitrate: rate,
          userLimit: 50,
          permissionOverwrites: [
            {
              type: "member",
              id: client.user.id,
              allow: ["Connect", "Speak", "ViewChannel", "RequestToSpeak"],
            },
            {
              type: "role",
              id: interaction.guild.roles.everyone.id,
              allow: ["Connect", "ViewChannel"],
            }
          ]
        });

        const embed11 = new EmbedBuilder()
          .setColor(client.config.color)
          .setDescription(`${client.config.emojis.error} Error creating a text channel, please try again later or check my permissions.`)
        if (!textChannel) return interaction.editReply(({ embeds: [embed11] }));
        const embed12 = new EmbedBuilder()
          .setColor(client.config.color)
          .setDescription(`${client.config.emojis.error} Error creating a voice channel, please try again later or check my permissions`)
        if (!voiceChannel) return interaction.editReply(({ embeds: [embed12] }));

        const setupText = client.channels.cache.get(textChannel.id);
        const msg = await setupText.send({
          files: [file],
          embeds: [embed1],
          components: [row1, row2]
        });

        data = new db({
          _id: interaction.guildId,
          channel: textChannel.id,
          message: msg.id,
          voiceChannel: voiceChannel.id,
          moderator: interaction.user.id,
          lastUpdated: Math.round(Date.now() / 1000)
        });

        await data.save();
        await interaction.editReply({ content: null, embeds: [new EmbedBuilder().setColor(client.config.color).setThumbnail(client.user.displayAvatarURL({})).setDescription(`**Successfully created a song request channel.**\n\n Song request channel: ${textChannel}\n- *You can rename or move this channel if you want to*.\n\nUse </setup delete:1024366986697916438> to delete the music request channel and </setup change:1024366986697916438> to change the music request channel.`)] }).catch(() => { });
        break;
      case 'change':
        if (!data) {
          const embed13 = new EmbedBuilder()
            .setColor(client.config.color)
            .setDescription(`The music request channel has not yet been setup.`)
          return await interaction.editReply(({ embeds: [embed13] }));
        }
        const channel = interaction.guild.channels.cache.get(interaction.options.getChannel("channel").id);
        const embed14 = new EmbedBuilder()
          .setColor(client.config.color)
          .setDescription(`${client.config.emojis.error} This channel is already in use of the setup, please provide another one.`)
        if (channel.id === data.channel) return await interaction.editReply(({ embeds: [embed14] }));
        const embed15 = new EmbedBuilder()
          .setColor(client.config.color)
          .setDescription(`${client.config.emojis.error} You've provide an invalid channel, please provide a text channel.`)
        if (!channel.type === 0) return await interaction.editReply(({ embeds: [embed15] }));

        let dataChannel = interaction.guild.channels.cache.get(channel.id);
        let m;

        try {
          if (dataChannel) m = await dataChannel.messages.fetch({ message: data.message, cache: true, force: true });
        } catch (e) { };

        if (m) await m.delete().catch(() => { });

        m = await channel.send({
          files: [file],
          embeds: [embed1],
          components: [row1, row2]
        });

        data.channel = channel.id;
        data.message = m.id;
        data.lastUpdated = Math.round(Date.now() / 1000);
        data.moderator = interaction.user.id;
        data.logs.push({
          userId: interaction.user.id,
          userName: interaction.user.username,
          updatedOn: Math.round(Date.now() / 1000),
          mainUpdate: "channel",
          channelName: channel.name,
          channelId: channel.id,
          oldChannelName: dataChannel ? dataChannel.name : null,
          oldChannelId: dataChannel ? dataChannel.id : null,
        });

        await data.save();
        await interaction.editReply({ content: null, embeds: [new EmbedBuilder().setColor(client.config.color).setThumbnail(client.user.displayAvatarURL({})).setDescription(`**Successfully changed the song request channel.**\n\n New song request channel: ${channel}\n- *You can rename or move this channel if you want to*.\n\nUse </setup delete:1024366986697916438> to delete the music request channel and </setup change:1024366986697916438> to change the music request channel.`)] }).catch(() => { });
        break;
      case 'delete':
        if (!data) {
          const embed16 = new EmbedBuilder()
            .setColor(client.config.color)
            .setDescription(`The music request channel has not yet been setup.`)
          return await interaction.editReply(({ embeds: [embed16] }));
        }
        const voiceChannel2 = interaction.guild.channels.cache.get(data.voiceChannel);
        const channel2 = interaction.guild.channels.cache.get(data.channel);
        try {
          if (channel2) {
            await channel2.delete();
          }
          if (voiceChannel2) {
            await voiceChannel2.delete();
          }
        } catch (e) { };
        await data.delete();
        const embed17 = new EmbedBuilder()
          .setColor(client.config.color)
          .setDescription(`${client.config.emojis.success} Successfully deleted the server music request channel data.`)
        await interaction.editReply(({ embeds: [embed17] }));

        break;
      case 'info':
        if (!data) {
          const embed18 = new EmbedBuilder()
            .setColor(client.config.color)
            .setDescription(`The music request channel has not yet been setup.`)
          return await interaction.editReply(({ embeds: [embed18] }));
        }
        const embed003 = client.embed()
          .setColor(color)
          .setTitle("Setup information")
          .addFields([
            {
              name: "Text channel",
              value: `<#${data.channel}> **(Id: ${data.channel})**`,
              inline: false
            },
            {
              name: "Setup by",
              value: `<@${data.moderator}> **(Id: ${data.moderator})**`,
              inline: false
            },
            {
              name: "Last updated",
              value: `<t:${data.lastUpdated}>`,
              inline: false
            }
          ]);
        await interaction.editReply({ content: null, embeds: [embed003] }).catch(() => { });
        break;
    }
  }
}
