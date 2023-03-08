const Command = require('../../structures/Command');
const { paginate } = require('../../handlers/functions');

module.exports = class Commands extends Command {
  constructor(client) {
    super(client, {
      name: 'commands',
      description: {
        content: 'List of commands that are available',
        usage: 'commands',
        examples: ['commands']
      },
      category: 'info',
      aliases: ['cmds', 'cmd'],
      cooldown: 3,
      permissions: {
        dev: false,
        client: ["SendMessages", "ViewChannel", "EmbedLinks"],
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
    let prefix = '/';
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
      let embed = client.embed().setColor(client.config.color).setTitle("Reverb's command list").setFooter({ text: `Page ${i + 1}/${pagesNum}`, iconURL: interaction.user.displayAvatarURL({}) }).setDescription(`Total commands: **${commands.length}**\n\n${str}\n\nNote: to know more about these commands use /help <command>`);
      pages.push(embed);
    }
    paginate(client, interaction, pages)

  }

}
