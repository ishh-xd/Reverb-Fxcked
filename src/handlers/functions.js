const { Message, EmbedBuilder, Client, TextChannel, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ComponentType, CommandInteraction, ButtonStyle, ButtonInteraction, SelectMenuInteraction, User } = require("discord.js");
const prefixSchema = require("../schemas/prefix");
const { convertTime, chunk } = require("../utils/convert");
const setupSchema = require("../schemas/setup");
const { readdirSync } = require('node:fs')
const djroleSchema = require("../schemas/dj");

/**
 * 
 * @param {String} id 
 * @param {Client} client
 * @returns {String}
 */

async function getPrefix(id, client) {
  let prefix = client.config.prefix;
  let data = await prefixSchema.findOne({ _id: id });
  if (data && data.prefix) prefix = data.prefix;

  return prefix;
};

/**
 * 
 * @param {Array} x 
 */

function shuffleArray(x) {
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [x[i], x[j]] = [x[j], x[i]];
  };
};

async function paginate(client, interaction, pages, timeout = 60000) {

  if (pages.length < 2) {
    if (interaction instanceof CommandInteraction) {
      interaction.deferred ? await interaction.followUp({ embeds: pages }) : await interaction.reply({ embeds: pages });
    } else {
      await interaction.channel.send({ embeds: pages });
    }
  }
  let page = 0;
  const generatePage = (page) => {
    let firstEmbed = page === 0;
    let lastEmbed = page === pages.length - 1;
    const embed = pages[page];
    const first = new ButtonBuilder()
      .setCustomId('first')
      .setEmoji(client.config.emojis.previous)
      .setStyle(2);
    if (firstEmbed) first.setDisabled(true);
    const back = new ButtonBuilder()
      .setCustomId('back')
      .setEmoji(client.config.emojis.left)
      .setStyle(2);
    if (firstEmbed) back.setDisabled(true);
    const next = new ButtonBuilder()
      .setCustomId('next')
      .setEmoji(client.config.emojis.right)
      .setStyle(2);
    if (lastEmbed) next.setDisabled(true);
    const last = new ButtonBuilder()
      .setCustomId('last')
      .setEmoji(client.config.emojis.next)
      .setStyle(2);
    if (lastEmbed) last.setDisabled(true);
    const stop = new ButtonBuilder()
      .setCustomId('stop')
      .setEmoji(client.config.emojis.x)
      .setStyle(2);
    const row = new ActionRowBuilder()
      .addComponents(first, back, stop, next, last);
    return { embeds: [embed], components: [row] };
  }
  const msgOptions = generatePage(0);
  let msg;
  if (interaction instanceof CommandInteraction) {
    msg = interaction.deferred ? await interaction.followUp({
      ...msgOptions,
      fetchReply: true
    }) : await interaction.reply({
      ...msgOptions,
      fetchReply: true
    });
  } else {
    msg = await interaction.channel.send({
      ...msgOptions,
    });
  }
  const filter = i => i.customId === 'first' || i.customId === 'back' || i.customId === 'next' || i.customId === 'last' || i.customId === 'stop';
  const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, filter, time: timeout });

  collector.on('collect', async i => {
    if (i.user.id === interaction.user.id) {
      await i.deferUpdate();
      if (i.customId === 'first') {
        if (page !== 0) {
          page = 0;
          const msgOptions = generatePage(page);
          await i.editReply(msgOptions);
        }
      }
      if (i.customId === 'back') {
        if (page !== 0) {
          page--;
          const msgOptions = generatePage(page);
          await i.editReply(msgOptions);
        }
      }
      if (i.customId === 'next') {
        if (page !== pages.length - 1) {
          page++;
          const msgOptions = generatePage(page);
          await i.editReply(msgOptions);
        }
      }
      if (i.customId === 'last') {
        if (page !== pages.length - 1) {
          page = pages.length - 1;
          const msgOptions = generatePage(page);
          await i.editReply(msgOptions);
        }
      }
      if (i.customId === 'stop') {
        collector.stop();
        await i.editReply({ embeds: [pages[page]], components: [] });
      }
    } else {
      const embed = new EmbedBuilder()
        .setColor(client.config.color)
        .setDescription(`You cannot use this button`)
      await i.reply({ embeds: [embed], ephemeral: true });
    }
  });
  collector.on('end', async () => {
    await msg.edit({ embeds: [pages[page]], components: [] });
  });

}


/**
 * 
 * @param {String} commandName 
 * @param {Message} message 
 * @param {String} args
 * @param {Client} client 
 */

async function invalidArgs(commandName, interaction, args, client) {
  try {
    let color = client.config.color ? client.config.color : "#ff0080";
    let prefix = '/';
    let command = client.commands.get(commandName) || client.commands.get(client.aliases.get(commandName));
    if (!command) return await message.reply({
      embeds: [new EmbedBuilder().setColor(color).setDescription(args)], allowedMentions: {
        repliedUser: false
      }
    }).catch(() => { });
    let embed1 = new EmbedBuilder().setColor(color).setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({}).toString() }).setDescription(`**${args}**`).setTitle(`__${command.name}__`).addFields([
      {
        name: "Usage",
        value: `\`${command.description.usage ? `${prefix}${command.name} ${command.description.usage}` : `${prefix}${command.name}`}\``,
        inline: false
      }, {
        name: "Example(s)",
        value: `${command.description.examples ? `\`${prefix}${command.description.examples.join(`\`\n\`${prefix}`)}\`` : "`" + prefix + command.name + "`"}`
      }
    ]);
    if (!interaction.replied) {
      return await interaction.editReply({
        embeds: [embed1],
        allowedMentions: { repliedUser: false }
      }).catch(() => { });
    } else {
      return await interaction.followUp({
        embeds: [embed1],
        allowedMentions: { repliedUser: false }
      });
    }
  } catch (e) {
    console.error(e);
  };
};

/**
 * 
 * @param {TextChannel} channel 
 * @param {String} args 
 * @param {String} color
 */

async function oops(channel, args, color) {
  try {
    let embed1 = new EmbedBuilder().setColor(color ? color : "#ff0080").setDescription(`${args}`);

    const m = await channel.send({
      embeds: [embed1]
    });

    setTimeout(async () => await m.delete().catch(() => { }), 12000);
  } catch (e) {
    return console.error(e)
  }
};

/**
 * 
 * @param {TextChannel} channel 
 * @param {String} args 
 * @param {String} color 
 * @returns {Promise<void | Message}
 */

async function good(channel, args, color) {
  color = color ? color : "#ff0080";
  return await channel.send({
    embeds: [new EmbedBuilder().setColor(color).setDescription(`${args}`)]
  }).catch(() => { });
};

async function qeb(client, embed, player) {
  let author = player.queue.current.author ? player.queue.current.author : 'Unknown';
  let map = player.queue.map((x, i) => `**${i + 1}.** ${x.title && x.uri ? `[${x.title}](${x.uri})` : `${x.title}`}`);
  let pages = chunk(map, 2).map((x) => x.join("\n"));
  let page = 0;
  let fields = []
  fields.push(
    {
      name: "Queued Track(s)",
      value: `${player.queue.length ? player.queue.length : `0`}`,
      inline: true
    },
    {
      name: "Track Loop",
      value: `${player.loop === 'track' ? `${client.config.emojis.online}` : `${client.config.emojis.offline}`}`,
      inline: true
    },
    {
      name: "Requested by",
      value: `${player.queue.current.requester}`,
      inline: true
    },
    {
      name: "Autoplay",
      value: `${player.autoplay ? `${client.config.emojis.online}` : `${client.config.emojis.offline}`}`,
      inline: true
    },
    {
      name: "Duration",
      value: `${convertTime(player.queue.length)}`,
      inline: true
    }
  );
  if (player.queue.length > 0) {
    fields.push({
      name: `Up next`,
      value: `${pages[page]}`,
      inline: true
    });
  } else {
    fields.push(
      {
        name: `Author`,
        value: `${author}`,
        inline: true
      },
    )
  }
  return embed.addFields(fields)
};
/**
 * 
 * @param {*} embed 
 * @param {Player} player 
 * @param {Client} client 
 * @returns 
 */

function neb(embed, player, client) {
  const author = player.getArtist(client, player.queue.current)

  let icon = player.queue?.current.thumbnail ? player.queue.current.thumbnail : client.config.links.image;
  return embed.setColor(client.config.color ? client.config.color : "#ff0080").setDescription(`Currently playing [${player.queue.current.title}](${player.queue.current.uri}) by ${author}`).setURL(player.queue.current.uri).setImage(icon);
};

/**
 * 
 * @param {String} query 
 * @param {Player} player 
 * @param {Message} message 
 * @param {String} color 
 */

async function playerhandler(client, query, player, message, color, interaction, track) {
  let m;
  let d = await setupSchema.findOne({ _id: message.guildId });
  let q = new EmbedBuilder().setTitle("Queue statistics").setColor(color);
  let n = new EmbedBuilder().setColor(color);

  try {
    if (d) m = await message.channel.messages.fetch({ message: d.message, cache: true, force: true });
  } catch (e) { };
  if (/^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi.test(query)) {
    return await oops(message.channel, "Unfortunately, due to recent demand from both Discord and Youtube, we have disabled the bot's ability to play YouTube URLs. This is a tremendous disappointment for everyone, including Reverb's team, however it is likely that this will be a permanent modification to prevent the bot from being unverified. We really regret any inconvenience and aim to have more alternative choices accessible in the near future.", color);
  }
  const { tracks, type, playlistName } = await player.search(query, { requester: message.author, engine: 'spotify' });
  if (!tracks.length) return await oops(message.channel, "No results found.", color);
  if (type === "PLAYLIST") {
    for (let track of tracks) {
      if (/^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi.test(track.uri)) {
        return await oops(message.channel, "Unfortunately, due to recent demand from both Discord and Youtube, we have disabled the bot's ability to play YouTube URLs. This is a tremendous disappointment for everyone, including Reverb's team, however it is likely that this will be a permanent modification to prevent the bot from being unverified. We really regret any inconvenience and aim to have more alternative choices accessible in the near future.", color);
      }
      player.queue.add(track);
    }
    if (!player.playing && !player.paused) player.play();
    const embed101 = new EmbedBuilder()
      .setColor(client.config.color)
      .setDescription(`${client.config.emojis.success} Added **${tracks.length}** tracks from [${playlistName.length > 64 ? playlistName.substring(0, 64) + "..." : playlistName}](${query}) to the queue.`)
    await message.channel.send({ embeds: [embed101] }).then((a) => setTimeout(async () => await a.delete().catch(() => { }), 5000)).catch(() => { });

    qeb(client, q, player);
    neb(n, player, client);
    if (m) await m.edit({ embeds: [q, n], files: [] }).catch(() => { });
  } else {
    if (/^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi.test(tracks[0].uri)) {
      return await oops(message.channel, "Unfortunately, due to recent demand from both Discord and Youtube, we have disabled the bot's ability to play YouTube URLs. This is a tremendous disappointment for everyone, including Reverb's team, however it is likely that this will be a permanent modification to prevent the bot from being unverified. We really regret any inconvenience and aim to have more alternative choices accessible in the near future.", color);
    }

    player.queue.add(tracks[0]);
    let author = await player.getArtist(client, tracks[0])
    if (!player.playing && !player.paused) player.play();
    const embed11 = new EmbedBuilder()
      .setColor(color)
      .setDescription(`${client.config.emojis.success} Added [${tracks[0].title.length > 64 ? tracks[0].title.substring(0, 64) + "..." : tracks[0].title}](${tracks[0].uri}) by ${author} to the queue at position **#${player.queue.length}**`)
    await message.channel.send({ embeds: [embed11] }).then((a) => setTimeout(async () => await a.delete().catch(() => { }), 5000)).catch(() => { });

    qeb(client, q, player);
    neb(n, player, client);
    if (m) await m.edit({ embeds: [q, n], files: [] }).catch(() => { });
  }
};

/**
 * 
 * @param {Player} player 
 * @param {Message} message 
 * @returns {Promise<void>}
 */

async function loopTrack(player, message) {
  let embed = new EmbedBuilder().setColor(color).setDescription(`${this.client.config.emojis.error} There is nothing playing right now.`);
  if (!player) return await oops(message.channel, { embeds: [embed] }).catch(() => { });
  if (!player.queue) return await oops(message.channel, { embeds: [embed] }).catch(() => { });
  if (!player.queue.current) return await oops(message.channel, { embeds: [embed] }).catch(() => { });

  if (player.trackRepeat) {
    player.setTrackRepeat(false);
    return await good(message.channel, `Track repeat/loop is now **disabled**.`);
  } else {
    player.setTrackRepeat(true);
    return await good(message.channel, `Track repeat/loop is now **enabled**.`);
  };
};

/**
 * 
 * @param {Player} player 
 * @param {Message} message 
 * @returns {Promise<void>}
 */

async function loopQueue(player, message) {
  let embed = new EmbedBuilder().setColor(color).setDescription(`${this.client.config.emojis.error} There is nothing playing right now.`);
  if (!player) return await oops(message.channel, `Nothing is playing right now.`);
  if (!player.queue) return await oops(message.channel, `Nothing is playing right now.`);
  if (!player.queue.current) return await oops(message.channel, `Nothing is playing right now.`);

  if (player.queueRepeat) {
    player.setQueueRepeat(false);
    if (message && message.deletable) await message.delete().catch(() => { });
    return await good(message.channel, `Queue repeat/loop is now **disabled**.`);
  } else {
    player.setQueueRepeat(true);
    if (message && message.deletable) await message.delete().catch(() => { });
    return await good(message.channel, `Queue repeat/loop is now **enabled**.`);
  };
};

/**
 * 
 * @param {Number} ms 
 * @returns {Promise<void>}
 */

function wait(ms) {
  return new Promise((resolve) => setTimeout(() => resolve, ms));
};

/**
 * 
 * @param {Client} client
 * @param {String} msgId
 * @param {TextChannel} channel 
 * @param {Player} player 
 * @param {import("erela.js").Track} track 
 * @param {Client} client
 * @param {String} color
 */

async function trackStartEventHandler(msgId, channel, player, track, client, color) {
  try {
    let author = await player.getArtist(client, track);
    let map = player.queue.map((x, i) => `**${i + 1}.** ${x.title && x.uri ? `[${x.title}](${x.uri})` : `${x.title}`}`);
    let pages = chunk(map, 2).map((x) => x.join("\n"));
    let page = 0;
    let icon = player.queue?.current.thumbnail ? player.queue.current.thumbnail : client.config.links.image;

    let message;
    try {

      message = await channel.messages.fetch({ message: msgId, cache: true, force: true });

    } catch (error) { };

    if (!message) {
      let embed2 = new EmbedBuilder()
        .setColor(color)
        .setDescription(`Currently playing [${track.title}](${track.uri}) by ${author}`)
        .setURL(track.uri)
        .setImage(icon);
      let fields = []
      fields.push(
        {
          name: "Queued Track(s)",
          value: `${player.queue.length ? player.queue.length : `0`}`,
          inline: true
        },
        {
          name: "Track Loop",
          value: `${player.loop === 'track' ? `${client.config.emojis.online}` : `${client.config.emojis.offline}`}`,
          inline: true
        },
        {
          name: "Requested by",
          value: `${track.requester}`,
          inline: true
        },
        {
          name: "Autoplay",
          value: `${player.autoplay ? `${client.config.emojis.online}` : `${client.config.emojis.offline}`}`,
          inline: true
        },
        {
          name: "Duration",
          value: `${convertTime(track.length)}`,
          inline: true
        }
      );
      if (player.queue.length > 0) {
        fields.push({
          name: `Up next`,
          value: `${pages[page]}`,
          inline: true
        });
      } else {
        fields.push(
          {
            name: `Author`,
            value: `${author}`,
            inline: true
          },
        )
      }

      let embed1 = new EmbedBuilder().setColor(color).setTitle("Queue statistics").addFields(fields);

      let pausebut = new ButtonBuilder().setCustomId(`SETUP_PLAY_PAUSE_BUTTON`).setEmoji(`${client.config.bemoji.pause}`).setStyle(2).setDisabled(false);

      let lowvolumebut = new ButtonBuilder().setCustomId(`SETUP_VOL_DOWN_BUTTON`).setEmoji(`${client.config.bemoji.voldown}`).setStyle(2).setDisabled(false);

      let highvolumebut = new ButtonBuilder().setCustomId(`SETUP_VOL_UP_BUTTON`).setEmoji(`${client.config.bemoji.volup}`).setStyle(2).setDisabled(false);

      let previousbut = new ButtonBuilder().setCustomId(`SETUP_PREVIOUS_BUTTON`).setEmoji(`${client.config.bemoji.previous}`).setStyle(2).setDisabled(false);

      let skipbut = new ButtonBuilder().setCustomId(`SETUP_SKIP_BUTTON`).setEmoji(`${client.config.bemoji.next}`).setStyle(2).setDisabled(false);

      let rewindbut = new ButtonBuilder().setCustomId(`REWIND_BUTTON`).setEmoji(`${client.config.bemoji.rewind}`).setStyle(2).setDisabled(false);

      let forwardbut = new ButtonBuilder().setCustomId(`FORWARD_BUTTON`).setEmoji(`${client.config.bemoji.forward}`).setStyle(2).setDisabled(false);

      let toggleautoplaybut = new ButtonBuilder().setCustomId(`AUTO_PLAY_BUTTON`).setEmoji(`${client.config.bemoji.infinity}`).setStyle(2).setDisabled(false);

      let loopmodesbut = new ButtonBuilder().setCustomId(`LOOP_MODE_BUTTON`).setEmoji(`${client.config.bemoji.loop}`).setStyle(2).setDisabled(false);

      let stopbut = new ButtonBuilder().setCustomId(`SETUP_STOP_BUTTON`).setEmoji(`${client.config.bemoji.stop}`).setStyle(2).setDisabled(false);


      const row1 = new ActionRowBuilder().addComponents(lowvolumebut, previousbut, pausebut, skipbut, highvolumebut);

      const row2 = new ActionRowBuilder().addComponents(rewindbut, toggleautoplaybut, stopbut, loopmodesbut, forwardbut);
      const embedcontent = new EmbedBuilder()
        .setColor(client.config.color)
        .setDescription(`Join a voice channel and queue songs by name/url.`)
      const m = await channel.send({
        files: [],
        embeds: [embedcontent, embed1, embed2],
        components: [row1, row2]
      });
      return await setupSchema.findOneAndUpdate({ _id: channel.guildId }, { message: m.id });
    } else {
      let fields = []
      fields.push(
        {
          name: "Queued Track(s)",
          value: `${player.queue.length ? player.queue.length : `0`}`,
          inline: true
        },
        {
          name: "Track Loop",
          value: `${player.loop === 'track' ? `${client.config.emojis.online}` : `${client.config.emojis.offline}`}`,
          inline: true
        },
        {
          name: "Requested by",
          value: `${track.requester}`,
          inline: true
        },
        {
          name: "Autoplay",
          value: `${player.autoplay ? `${client.config.emojis.online}` : `${client.config.emojis.offline}`}`,
          inline: true
        },
        {
          name: "Duration",
          value: `${convertTime(track.length)}`,
          inline: true
        }
      );
      if (player.queue.length > 0) {
        fields.push({
          name: `Up next`,
          value: `${pages[page]}`,
          inline: true
        });
      } else {
        fields.push(
          {
            name: `Author`,
            value: `${author}`,
            inline: true
          },
        )
      }
      let embed1 = new EmbedBuilder().setColor(color).setTitle("Queue statistics").addFields(fields);

      let embed2 = new EmbedBuilder()
        .setColor(color)
        .setDescription(`Currently playing [${track.title}](${track.uri}) by ${author}`)
        .setURL(track.uri)
        .setImage(icon);
      let pausebut = new ButtonBuilder().setCustomId(`SETUP_PLAY_PAUSE_BUTTON`).setEmoji(`${client.config.bemoji.pause}`).setStyle(2).setDisabled(false);

      let lowvolumebut = new ButtonBuilder().setCustomId(`SETUP_VOL_DOWN_BUTTON`).setEmoji(`${client.config.bemoji.voldown}`).setStyle(2).setDisabled(false);

      let highvolumebut = new ButtonBuilder().setCustomId(`SETUP_VOL_UP_BUTTON`).setEmoji(`${client.config.bemoji.volup}`).setStyle(2).setDisabled(false);

      let previousbut = new ButtonBuilder().setCustomId(`SETUP_PREVIOUS_BUTTON`).setEmoji(`${client.config.bemoji.previous}`).setStyle(2).setDisabled(false);

      let skipbut = new ButtonBuilder().setCustomId(`SETUP_SKIP_BUTTON`).setEmoji(`${client.config.bemoji.next}`).setStyle(2).setDisabled(false);

      let rewindbut = new ButtonBuilder().setCustomId(`REWIND_BUTTON`).setEmoji(`${client.config.bemoji.rewind}`).setStyle(2).setDisabled(false);

      let forwardbut = new ButtonBuilder().setCustomId(`FORWARD_BUTTON`).setEmoji(`${client.config.bemoji.forward}`).setStyle(2).setDisabled(false);

      let toggleautoplaybut = new ButtonBuilder().setCustomId(`AUTO_PLAY_BUTTON`).setEmoji(`${client.config.bemoji.infinity}`).setStyle(2).setDisabled(false);

      let loopmodesbut = new ButtonBuilder().setCustomId(`LOOP_MODE_BUTTON`).setEmoji(`${client.config.bemoji.loop}`).setStyle(2).setDisabled(false);

      let stopbut = new ButtonBuilder().setCustomId(`SETUP_STOP_BUTTON`).setEmoji(`${client.config.bemoji.stop}`).setStyle(2).setDisabled(false);

      const row1 = new ActionRowBuilder().addComponents(lowvolumebut, previousbut, pausebut, skipbut, highvolumebut);

      const row2 = new ActionRowBuilder().addComponents(rewindbut, toggleautoplaybut, stopbut, loopmodesbut, forwardbut);
      const embedcontent1 = new EmbedBuilder()
        .setColor(client.config.color)
        .setDescription(`Join a voice channel and queue songs by name/url.`)
      await message.edit({
        files: [],
        embeds: [embedcontent1, embed1, embed2],
        components: [row1, row2]
      });
    };
  } catch (err) {
    return console.error(err);
  }
};


async function updateQueue(client, player, guild) {

  try {
    let data = await setupSchema.findOne({ _id: guild.id });
    let color = client.config.color ? client.config.color : "BLURPLE";
    let map = player.queue.map((x, i) => `**${i + 1}.** ${x.title && x.uri ? `[${x.title}](${x.uri})` : `${x.title}`}`);
    let pages = chunk(map, 2).map((x) => x.join("\n"));
    let page = 0;
    if (player && player.queue && player.playing) {
      let icon = player.queue?.current.thumbnail ? player.queue.current.thumbnail : client.config.links.image;
      if (data && data.channel && data.message) {
        let guildId = client.guilds.cache.get(data._id)
        let textChannel = guildId.channels.cache.get(data.channel);
        if (textChannel) {
          let message;
          try {

            message = await textChannel.messages?.fetch(data.message, { cache: true, force: true });

          } catch (error) { };

          if (!message) return;
          let fields = []

          fields.push(
            {
              name: "Queued Track(s)",
              value: `${player.queue.length ? player.queue.length : `0`}`,
              inline: true
            },
            {
              name: "Track Loop",
              value: `${player.loop === 'track' ? `${client.config.emojis.online}` : `${client.config.emojis.offline}`}`,
              inline: true
            },
            {
              name: "Requested by",
              value: `${player.queue.current.requester}`,
              inline: true
            },
            {
              name: "Autoplay",
              value: `${player.autoplay ? `${client.config.emojis.online}` : `${client.config.emojis.offline}`}`,
              inline: true
            },
            {
              name: "Duration",
              value: `${convertTime(player.queue.length)}`,
              inline: true
            }
          );
          if (player.queue.length > 0) {
            fields.push({
              name: `Up next`,
              value: `${pages[page]}`,
              inline: true
            });
          } else {
            fields.push(
              {
                name: `Author`,
                value: `${player.queue.current.author}`,
                inline: true
              },
            )
          }
          let embed1 = new EmbedBuilder()
            .setColor(color)
            .setTitle("Queue statistics")
            .addFields(fields)
          let disabled = true;
          if (player.playing && player.queue.current) disabled = false;
          let pausebut = new ButtonBuilder().setCustomId(`SETUP_PLAY_PAUSE_BUTTON`).setEmoji(`${client.config.bemoji.pause}`).setStyle(2).setDisabled(disabled);

          let lowvolumebut = new ButtonBuilder().setCustomId(`SETUP_VOL_DOWN_BUTTON`).setEmoji(`${client.config.bemoji.voldown}`).setStyle(2).setDisabled(disabled);

          let highvolumebut = new ButtonBuilder().setCustomId(`SETUP_VOL_UP_BUTTON`).setEmoji(`${client.config.bemoji.volup}`).setStyle(2).setDisabled(disabled);

          let previousbut = new ButtonBuilder().setCustomId(`SETUP_PREVIOUS_BUTTON`).setEmoji(`${client.config.bemoji.previous}`).setStyle(2).setDisabled(disabled);

          let skipbut = new ButtonBuilder().setCustomId(`SETUP_SKIP_BUTTON`).setEmoji(`${client.config.bemoji.next}`).setStyle(2).setDisabled(disabled);

          let rewindbut = new ButtonBuilder().setCustomId(`REWIND_BUTTON`).setEmoji(`${client.config.bemoji.rewind}`).setStyle(2).setDisabled(disabled);

          let forwardbut = new ButtonBuilder().setCustomId(`FORWARD_BUTTON`).setEmoji(`${client.config.bemoji.forward}`).setStyle(2).setDisabled(disabled);

          let toggleautoplaybut = new ButtonBuilder().setCustomId(`AUTO_PLAY_BUTTON`).setEmoji(`${client.config.bemoji.infinity}`).setStyle(2).setDisabled(disabled);

          let loopmodesbut = new ButtonBuilder().setCustomId(`LOOP_MODE_BUTTON`).setEmoji(`${client.config.bemoji.loop}`).setStyle(2).setDisabled(disabled);

          let stopbut = new ButtonBuilder().setCustomId(`SETUP_STOP_BUTTON`).setEmoji(`${client.config.bemoji.stop}`).setStyle(2).setDisabled(disabled);

          const row1 = new ActionRowBuilder().addComponents([lowvolumebut, previousbut, pausebut, skipbut, highvolumebut]);

          const row2 = new ActionRowBuilder().addComponents([rewindbut, toggleautoplaybut, stopbut, loopmodesbut, forwardbut]);

          let embed2 = new EmbedBuilder()
            .setColor(color)
            .setDescription(`Currently playing [${player.queue.current.title}](${player.queue.current.uri}) by ${author}`)
            .setURL(player.queue.current.uri)
            .setImage(icon);
          const embedcontent2 = new EmbedBuilder()
            .setColor(client.config.color)
            .setDescription(`Join a voice channel and queue songs by name/url.`)
          await message.edit({
            files: [],
            embeds: [embedcontent2, embed1, embed2],
            components: [row1, row2]
          });
        } else return
      }
    } else {
      if (data && data.channel && data.message) {
        let guildId = client.guilds.cache.get(data._id)
        let textChannel = guildId.channels.cache.get(data.channel);

        let message;
        try {

          message = await textChannel.messages?.fetch(data.message, { cache: true, force: true });

        } catch (error) { };

        if (!message) return;

        let disabled = true;
        if (player.playing && player.queue.current) disabled = false;

        const imgs = readdirSync("./src/assets/images/").filter(c => c.split('.').pop() === 'png');

        let img = imgs[Math.floor(Math.random() * imgs.length)];

        let file = new AttachmentBuilder(`./src/assets/images/${img}`, `${img}`).setName(`MoE.png`)

        let embed2 = new EmbedBuilder().setColor(color).setTitle("**Join a voice channel and queue songs by name/url**",).setDescription(`[Invite](${client.config.links.invite}) ~ [Support Server](${client.config.links.server})`).setFooter({ text: `Thank you for using ${client.user.username}`, iconURL: client.user.displayAvatarURL() }).setImage(client.config.links.image);

        let pausebut = new ButtonBuilder().setCustomId(`SETUP_PLAY_PAUSE_BUTTON`).setEmoji(`${client.config.bemoji.pause}`).setStyle(2).setDisabled(disabled);

        let lowvolumebut = new ButtonBuilder().setCustomId(`SETUP_VOL_DOWN_BUTTON`).setEmoji(`${client.config.bemoji.voldown}`).setStyle(2).setDisabled(disabled);

        let highvolumebut = new ButtonBuilder().setCustomId(`SETUP_VOL_UP_BUTTON`).setEmoji(`${client.config.bemoji.volup}`).setStyle(2).setDisabled(disabled);

        let previousbut = new ButtonBuilder().setCustomId(`SETUP_PREVIOUS_BUTTON`).setEmoji(`${client.config.bemoji.previous}`).setStyle(2).setDisabled(disabled);

        let skipbut = new ButtonBuilder().setCustomId(`SETUP_SKIP_BUTTON`).setEmoji(`${client.config.bemoji.next}`).setStyle(2).setDisabled(disabled);

        let rewindbut = new ButtonBuilder().setCustomId(`REWIND_BUTTON`).setEmoji(`${client.config.bemoji.rewind}`).setStyle(2).setDisabled(disabled);

        let forwardbut = new ButtonBuilder().setCustomId(`FORWARD_BUTTON`).setEmoji(`${client.config.bemoji.forward}`).setStyle(2).setDisabled(disabled);

        let toggleautoplaybut = new ButtonBuilder().setCustomId(`AUTO_PLAY_BUTTON`).setEmoji(`${client.config.bemoji.infinity}`).setStyle(2).setDisabled(disabled);

        let loopmodesbut = new ButtonBuilder().setCustomId(`LOOP_MODE_BUTTON`).setEmoji(`${client.config.bemoji.loop}`).setStyle(2).setDisabled(disabled);

        let stopbut = new ButtonBuilder().setCustomId(`SETUP_STOP_BUTTON`).setEmoji(`${client.config.bemoji.stop}`).setStyle(2).setDisabled(disabled);

        const row1 = new ActionRowBuilder().addComponents([lowvolumebut, previousbut, pausebut, skipbut, highvolumebut]);

        const row2 = new ActionRowBuilder().addComponents([rewindbut, toggleautoplaybut, stopbut, loopmodesbut, forwardbut]);

        await message.edit({
          files: [file],
          content: null,
          embeds: [embed2],
          components: [row1, row2]
        });

      }
    }

  } catch (error) {
    return console.error(error);
  }

}


/**
 * 
 * @param {CommandInteraction | ButtonInteraction | SelectMenuInteraction} interaction 
 * @param {String} args 
 * @param {String} color
 */

async function intReply(interaction, args) {
  if (!interaction) return;

  if (interaction.replied) {
    return await interaction.editReply(args).catch(() => { });
  } else {
    return await interaction.followUp(args).catch(() => { });
  };
};

async function intCheck(interaction, permission) {
  let data = await djroleSchema.findOne({ _id: interaction.guildId });
  let check = false;
  if (!data) {
    if (interaction.member.permissions.has(permission)) check = true;
  } else {
    if (data.mode) {
      let pass = false;

      if (data.roles.length > 0) {
        interaction.member.roles.cache.forEach((x) => {
          let role = data.roles.find((r) => r === x.id);
          if (role) pass = true;
        });
      };

      if (!pass) {
        if (interaction.member.permissions.has(permission)) check = true;
        else check = false;
      } else {
        check = true;
      };
    } else {
      check = true;
    };
  };

  return check;
};


/**
 * 
 * @param {Player} player 
 * @param {User} requester 
 */

async function autoplay(player, client) {
  let track = player.data.get("autoplay");
  try {
    if (track.uri.includes('https://open.spotify.com')) {
      const songData = await client.spotify.getTrack(track.uri.split('track/')[1]);
      const rawData = await client.spotify.getRecommendations(songData.artists[0].id, songData.id, 10);

      const { tracks } = await player.search(rawData.tracks[0].external_urls.spotify, { requester: client.user, engine: 'spotify' });

      return player.queue.add(tracks[0]);
    } else {
      return null
    };
  } catch {
    return null
  }

}

/**
 * 
 * @param {Array} array 
 * @param {Number} trackNumber 
 * @param {Number} to 
 */

function moveArray(array, trackNumber, to) {
  array = [...array];
  const s = trackNumber < 0 ? array.length + trackNumber : trackNumber;
  if (s >= 0 && s < array.length) {
    const e = to < 0 ? array.length + to : to;
    const [i] = array.splice(trackNumber, 1);
    array.splice(e, 0, i);
  };

  return array;
};
/**
 * 
 * 
 * @param {Message} message Message
 * @param {String} args Arguments
 * @param {String} color Color
 * @returns {Promise<Message>}
 * 
 * returns a message
 */

async function msgReply(message, args, color) {
  if (!color) color = "#ff0080";

  return await message.reply({
    embeds: [new EmbedBuilder().setColor(color).setDescription(args)]
  });
};

/**
 * 
 * @param {ButtonInteraction} int 
 * @param {String} args 
 * @param {String} color 
 */

async function buttonReply(int, args, color) {
  if (!color) color = "#ff0080";

  if (int.replied) {
    await int.editReply({ embeds: [new EmbedBuilder().setColor(color).setAuthor({ name: int.member.user.tag, iconURL: int.member.user.displayAvatarURL({}) }).setDescription(args)] })
  } else {
    await int.followUp({ embeds: [new EmbedBuilder().setColor(color).setAuthor({ name: int.member.user.tag, iconURL: int.member.user.displayAvatarURL({}) }).setDescription(args)] })
  };

  setTimeout(async () => {
    if (int && !int.ephemeral) {
      await int.deleteReply().catch(() => { });
    };
  }, 2000);
};

/**
 * 
 * @param {Message} msg 
 * @param {String} args 
 * @param {String} color 
 * @returns {Promise<Message | void>}
 */

async function replyOops(msg, args, color) {
  if (!msg) return;
  if (!args) return;
  if (!color) color = "#ff0080";

  let embed = new EmbedBuilder().setColor(color).setDescription(`${args}`);
  let m = await msg.reply({ embeds: [embed] });

  setTimeout(async () => {
    if (m && m.deletable) await m.delete().catch(() => { });
  }, 7000);
};

module.exports = {
  replyOops,
  buttonReply,
  msgReply,
  getPrefix,
  invalidArgs,
  oops,
  good,
  paginate,
  playerhandler,
  loopTrack,
  loopQueue,
  wait,
  trackStartEventHandler,
  intReply,
  intCheck,
  shuffleArray,
  autoplay,
  moveArray,
  updateQueue,
};
