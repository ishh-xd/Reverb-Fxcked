const Command = require('../../structures/Command');
const { convertTime, StringToMs } = require("../../utils/convert");
const { intReply } = require('../../handlers/functions');
module.exports = class Rewind extends Command {
    constructor(client) {
        super(client, {
            name: 'rewind',
            description: {
                content: 'To rewind the current song.',
                usage: 'rewind <time>',
                examples: ['rewind 10', 'rewind 1:30', 'rewind 1m 30s']
            },
            category: 'music',
            cooldown: 6,
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
                    name: 'time',
                    description: 'The time you want to rewind the song to.',
                    type: 3,
                    required: true,
                },
            ],
        });
    }

    async run(client, interaction) {
        if(!interaction.replied) await interaction.deferReply().catch(() => { });
        const player = client.player.players.get(interaction.guildId);
        if(!player.queue.current.isSeekable) return await intReply(interaction, `${client.config.emojis.error} This track is not seekable.`);
        const args = interaction.options.getString('time');
        
        const seconds = StringToMs(args);
        let position = 10000;
        if (seconds) position = parseInt(seconds) * 1000;
        let seekPosition = player.shoukaku.position - position;
        if (seekPosition <= 0) return await intReply(interaction, `${client.config.emojis.error} You cannot rewind the song to a negative duration.`);
        player.shoukaku.seekTo(seekPosition);
        return await intReply(interaction, `${client.config.emojis.success} Rewinded **${convertTime(position)}** to **${convertTime(player.shoukaku.position)} / ${convertTime(player.queue.current.length)}**`);
    }
}