const Command = require('../../structures/Command');
const { convertTime, StringToMs } = require("../../utils/convert");
const { intReply } = require('../../handlers/functions');
module.exports = class Forward extends Command {
    constructor(client) {
        super(client, {
            name: 'forward',
            description: {
                content: 'Forwards the current song by the specified amount.',
                usage: 'forward <seconds>',
                examples: ['forward 30', 'forward 1:30']
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
                    description: 'The amount of seconds to forward the song by.',
                    type: 3,
                    required: true,
                },
            ],
        })
    }
    async run(client, interaction) {
        if(!interaction.replied) await interaction.deferReply().catch(() => { });
        const player = client.player.players.get(interaction.guildId);
        const args = interaction.options.getString('time');
        
        if(!player.queue.current.isSeekable) return await intReply(interaction, `${client.config.emojis.error} This track is not seekable.`);
       
        const seconds = StringToMs(args);
        let position = 10000;
        if(seconds) position = parseInt(seconds)*1000;
        let seekPosition = player.shoukaku.position + position;
        if(seekPosition >= player.queue.current.length) return await intReply(interaction, `${client.config.emojis.error} This track cannot be forwarded any further.`);   
        
        player.shoukaku.seekTo(seekPosition);
        return await intReply(interaction, `${client.config.emojis.success} Forwared **${convertTime(position)}** to **${convertTime(player.shoukaku.position)} / ${convertTime(player.queue.current.length)}**`);
    }
}