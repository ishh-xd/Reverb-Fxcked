const { intReply } = require('../../handlers/functions');
const Command = require('../../structures/Command');
const { convertTime, StringToMs } = require("../../utils/convert");

module.exports = class Seek extends Command {
  constructor(client) {
    super(client, {
      name: 'seek',
      description: {
        content: 'To seek to a duration in the current song.',
        usage: 'seek <position>',
        examples: ['seek 5m']
      },
      category: 'music',
      cooldown: 3,
      player: {
        voice: true,
        dj: true,
        active: true,
        djPerm: ['DeafenMembers'],
      },
      permissions: {
        dev: false,
        client: ["SendMessages", "ViewChannel", "EmbedLinks", "Connect", "Speak"],
        user: [],
      },
      options: [
        {
          name: 'duration',
          description: 'The duration you want to seek to.',
          type: 3,
          required: true,
        },

      ],
    });
  }

  async run(client, interaction) {
    if (!interaction.replied) await interaction.deferReply().catch(() => { });
    const player = client.player.players.get(interaction.guildId);
    const { duration, isSeekable } = player.queue.current;
    const args = interaction.options.getString('position');
    if (!isSeekable) return await intReply(interaction, `${client.config.emojis.error} Unable to seek this track.`);
    let position = StringToMs(args);

    if (isNaN(position)) return await intReply(interaction, `${client.config.emojis.error} Duration must be a valid number.`);
    if (position < 0) return await intReply(interaction, `${client.config.emojis.error} Duration must not be lower than 0.`);
    if (position >= duration) return await intReply(interaction, `${client.config.emojis.error} Duration must be lower than the songs duration.`);

    player.shoukaku.seekTo(position);
    return await intReply(interaction, `${client.config.emojis.success} Seeked \`[ ${convertTime(position)} ]\` to \`[ ${convertTime(player.shoukaku.position)} / ${convertTime(duration)} ]\``);
  }
}