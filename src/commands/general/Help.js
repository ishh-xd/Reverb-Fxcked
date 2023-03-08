const Command = require('../../structures/Command');
const { ActionRowBuilder, ButtonStyle, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require('discord.js');
const { paginate, intReply } = require('../../handlers/functions');

module.exports = class Help extends Command {
  constructor(client) {
    super(client, {
      name: 'help',
      description: {
        content: 'Shows a list of all commands or info about a specific command.',
        usage: '<prefix>help [command]',
        examples: ['help', 'help play']
      },
      category: 'info',
      cooldown: 3,
      permissions: {
        dev: false,
        client: ["SendMessages", "ViewChannel", "EmbedLinks"],
        user: [],
      },
      options: [
        {
          name: 'command',
          type: 3,
          required: false,
          description: 'The command to view the help page of.',
        }
      ],
      player: {
        voice: false,
        dj: false,
        active: false,
        djPerm: null,
      },

    })
  }

  async run(client, interaction) {
    const prefix = '/'

    const input = interaction.options.getString("command");

    if (input) {
      let categoryName, cmds;
      if (["command", "commands", "cmd", "cmds"].includes(input)) {
        let commands = []
        for (const guild of client.commands.filter((x) => x.category && x.category !== "Developer").values()) {
          commands.push(guild)
        }
        let pagesNum = Math.ceil(commands.length / 10);
        if (pagesNum === 0) pagesNum = 1;
        const pages = [];
        let n = 1;
        for (let i = 0; i < pagesNum; i++) {
          const str = `${commands.slice(i * 10, i * 10 + 10).map(x => `> \`${prefix}${x.name}\`: ${x.description.content}`).join('\n')}`;
          let embed = client.embed().setColor(client.config.color).setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() }).setTitle("Message Commands List(s)").setFooter({ text: `Page ${i + 1}/${pagesNum}`, iconURL: interaction.user.displayAvatarURL({}) }).setDescription(`**Total commands:** **${commands.length}**\n\n${str}\n\n*Note: To get more extended view info of these commands, do ${client.config.cmdId.help} \`<command_name>\`*`);
          pages.push(embed);
        }
        paginate(client, interaction, pages, 600000)
      } else if (["General"].includes(input)) {
        categoryName = "General";
        cmds = client.commands.filter((x) => x.category && x.category === categoryName).map((x) => `\`${x.name}\``);

        return await interaction.reply({ embeds: [client.embed().setColor(client.config.color).setTitle(`${categoryName} commands`).setDescription(cmds.join(", ")).setFooter({ text: `Total ${cmds.length} ${categoryName.toLowerCase()} slash commands.` })] }).catch(() => { });
      } else if (["Music"].includes(input)) {
        categoryName = "Music";
        cmds = client.commands.filter((x) => x.category && x.category === categoryName).map((x) => `\`${x.name}\``);
        return await interaction.reply({ embeds: [client.embed().setColor(client.config.color).setTitle(`${categoryName} commands`).setDescription(cmds.join(", ")).setFooter({ text: `Total ${cmds.length} ${categoryName.toLowerCase()} slash commands.` })] }).catch(() => { });
      } else if (["Filters"].includes(input)) {
        categoryName = "Filters";
        cmds = client.commands.filter((x) => x.category && x.category === categoryName).map((x) => `\`${x.name}\``);
        return await interaction.reply({ embeds: [client.embed().setColor(client.config.color).setTitle(`${categoryName} commands`).setDescription(cmds.join(", ")).setFooter({ text: `Total ${cmds.length} ${categoryName.toLowerCase()} slash commands.` })] }).catch(() => { });
      } else if (["Settings", "Config"].includes(input)) {
        categoryName = "Settings";
        cmds = client.commands.filter((x) => x.category && x.category === categoryName).map((x) => `\`${x.name}\``);

        return await interaction.reply({ embeds: [client.embed().setColor(client.config.color).setTitle(`${categoryName} commands`).setDescription(cmds.join(", ")).setFooter({ text: `Total ${cmds.length} ${categoryName.toLowerCase()} slash commands.` })] }).catch(() => { });
      } else {
        const command = client.commands.get(input);
        const embed101 = new EmbedBuilder()
          .setColor(client.config.color)
          .setDescription(`${client.config.emojis.error} Couldn't find any command named "${input}"`)
        if (!command) return await interaction.reply(({ embeds: [embed101] }));

        let commandExamples = [];
        if (Array.isArray(command.description.examples)) for (let i of command.description.examples) commandExamples.push(`${prefix}${i}`);

        const fieldData = [
          {
            name: "Usage",
            value: `${command.description.usage ? `${prefix}${command.name} ${command.description.usage}` : `${prefix}${command.name}`}`,
            inline: false
          },
          {
            name: "Cooldown",
            value: `${command.cooldown ? `${command.cooldown}s` : "`[ 3s ]`"}`,
            inline: false
          },
          {
            name: "Category",
            value: `${command.category ? command.category : "None"}`,
            inline: false
          }
        ];

        if (commandExamples.length > 0) fieldData.push({
          name: "Example(s)",
          value: `${commandExamples.map((x) => `${x}`).join("\n")}`,
          inline: false
        });

        const embed1 = client.embed().setColor(client.config.color).setDescription(`${command.description.content}`).setTitle(`**${command.name}** command information`).addFields(fieldData);

        return await interaction.reply({ embeds: [embed1] }).catch(() => { });
      }
    } else {
      if (!interaction.replied) await interaction.deferReply().catch(() => { });
      const embed = client.embed()
        .setTitle(`Reverb's help page`)
        .setDescription(`Hey there <@${interaction.user.id}>, your help has arrived!\n\n[Reverb](https://discord.gg/UxuQuAYKTe) is a discord music bot with lots of features and high-quality music! \n\n**Reverb's command categories**\n\n<:smallcircle:984738535900844042> General\n<:smallcircle:984738535900844042> Music\n<:smallcircle:984738535900844042> Filters\n<:smallcircle:984738535900844042> Settings\n\n Choose a category below for General, Music, Filters and Settings commands.\n\n[Invite me](https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=36768832&scope=bot%20applications.commands) • [Support server](https://discord.gg/UxuQuAYKTe) • [Website](https://reverb.ml)`)
        .setFooter({ text: `To know more about a specific command use ${prefix}help <command>` })
        .setColor(client.config.color)
        .setThumbnail(client.user.displayAvatarURL({}))
      const emojis = {
        music: `${client.config.bemoji.music_em}`,
        filters: `${client.config.bemoji.filters_em}`,
        playlists: `${client.config.bemoji.playlist_em}`,
        settings: `${client.config.bemoji.settings_em}`,
        general: `${client.config.bemoji.general_em}`
      }
      const selectMenuArray = [];

      for (const category of client.commands.map((x) => x.category).filter((x, i, a) => a.indexOf(x) === i)) {
        selectMenuArray.push({
          label: category,
          value: category,
          description: `View ${category} commands`,
          emoji: emojis[category]
        });
      }
      const selectMenuRow = new ActionRowBuilder()
        .addComponents(
          new SelectMenuBuilder()
            .setCustomId('HELP_SELECT_MENU')
            .setPlaceholder('Nothing selected')
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions(selectMenuArray)
        );
      const buttons = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setLabel('Invite')
            .setStyle(ButtonStyle.Link)
            .setURL(client.config.links.invite),
          new ButtonBuilder()
            .setLabel('Support Server')
            .setStyle(ButtonStyle.Link)
            .setURL(client.config.links.server),
        );
      const msg = await interaction.editReply({ embeds: [embed], components: [selectMenuRow, buttons] })
      const Emojis = {
        music: `${client.config.emojis.music_em}`,
        filters: `${client.config.emojis.filters_em}`,
        playlists: `${client.config.emojis.playlist_em}`,
        settings: `${client.config.emojis.settings_em}`,
        general: `${client.config.emojis.general_em}`
      }
      const filter = (interaction) => interaction.user.id === interaction.user.id;
      const collector = msg.createMessageComponentCollector({ filter, time: 30000 });
      collector.on('collect', async (interaction) => {
        if (interaction.customId != 'HELP_SELECT_MENU') return;
        if (interaction.user.id != interaction.user.id) return;
        interaction.deferUpdate();
        const selected = interaction.values[0];
        const categoryName = selected;
        const cmds = client.commands.filter((x) => x.category && x.category === categoryName).map((x) => `\`${x.name}\``);
        const embed = client.embed()
          .setColor(client.config.color)
          .setTitle(`${Emojis[categoryName]} ${categoryName} commands`)
          .setDescription(cmds.join(", "))
          .setFooter({ text: `Total ${cmds.length} ${categoryName} slash commands.` });
        if (msg) await msg.edit({ embeds: [embed], components: [selectMenuRow, buttons] });
      });
      collector.on('end', async () => {
        if (msg) await msg.edit({ components: [buttons] });
      });
    }
  }
}

