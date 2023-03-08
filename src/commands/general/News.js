const Command = require('../../structures/Command');
const { PermissionsBitField, ActionRowBuilder, EmbedBuilder, ButtonStyle } = require('discord.js');

module.exports = class News extends Command {
  constructor(client) {
    super(client, {
      name: 'news',
      description: {
        content: "Shows Reverb's latest news",
        usage: '',
        examples: ['news']
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

    const embed = new EmbedBuilder()
      .setColor(client.config.color)
      .setTitle(`${client.user.username}'s news`)
      .setDescription(`Use the buttons below to view the annoucement or changelog.`)


    let but1 = client.button().setCustomId("announcement").setLabel("Annoucement").setStyle(ButtonStyle.Danger)

    let but2 = client.button().setCustomId("changelog").setLabel("Changelog").setStyle("3")

    let _commands;
    await interaction.reply({ embeds: [embed], components: [new ActionRowBuilder().addComponents(but1, but2)] });
    const filter = (interaction) => interaction.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 30000 });
    collector.on("end", async () => {
      if (!interaction) return;
      await interaction.editReply({ components: [new ActionRowBuilder().addComponents(but1.setDisabled(true), but2.setDisabled(true))] }).catch(() => { });
    });
    collector.on('collect', async (b) => {
      if (!b.deferred) await b.deferUpdate()
      if (b.customId === "announcement") {
        _commands = client.commands.filter((x) => x.category && x.category === "Music").map((x) => `\`${x.name}\``);
        const editEmbed = new EmbedBuilder()
          .setColor(client.config.color)
          .setDescription(`**Annoucement**

<:smallcircle:984738535900844042> Reverb  surpassed 6000 servers
<:smallcircle:984738535900844042> Reverb only supports **Spotify** and **SoundCloud** as a streaming platform (YouTube links or video titles won't work anymore)

**Author** : LMG XENON#0001\n**Time published**: 10:40 AM Monday, October 13, 2022 (GMT+1)`);
        return await interaction.editReply({ embeds: [editEmbed], components: [new ActionRowBuilder().addComponents(but1, but2)] })
      }
      if (b.customId === "changelog") {
        _commands = client.commands.filter((x) => x.category && x.category === "Music").map((x) => `\`${x.name}\``); const editEmbed2 = new EmbedBuilder().setColor(client.config.color)
          .setDescription(`**Changelog**

<:smallcircle:984738535900844042> New features 

- Completely removed YouTube support from the player
- Revamped UI
- Added a DJ system
- Added a announcing system
- Add the fixvoice command
- Added more filters
- Better response/ping
- Added clusters

**Author** : LMG XENON#0001\n**Time published**: 10:40 AM Monday, October 13, 2022 (GMT+1)`);
        return await interaction.editReply({ embeds: [editEmbed2], components: [new ActionRowBuilder().addComponents(but1, but2)] })
      }

    });
  }
}

