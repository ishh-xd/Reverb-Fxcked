const { intReply } = require('../../handlers/functions');
const Command = require('../../structures/Command');
const { convertTime } = require('../../utils/convert');

module.exports = class NowPlaying extends Command {
    constructor(client) {
        super(client, {
            name: 'nowplaying',
            description: {
                content: 'Shows the current playing song.',
                usage: 'nowplaying',
                examples: []
            },
            category: 'music',
            cooldown: 6,
            player: {
                voice: false,
                dj: false,
                active: true,
                djPerm: ["DeafenMembers"],
            },
            permissions: {
                dev: false,
                client: ["SendMessages", "ViewChannel", "EmbedLinks"],
                user: [],
            },
        })
    }
    /**
     * 
     * @param {import('../../structures/Client')} client 
     * @param {import('discord.js').CommandInteraction} interaction 
     * @returns 
     */
    async run(client, interaction) {
        if (!interaction.replied) await interaction.deferReply().catch(() => { });
        let player = client.player.players.get(interaction.guildId);

        const { title, uri, length, requester, thumbnail, isStream } = player.queue.current;
       
        const parsedCurrentDuration = convertTime(player.shoukaku.position || 0);
        const parsedDuration = convertTime(length);
        const part = Math.floor((player.shoukaku.position / length) * 13);
        const percentage = player.shoukaku.position / length;
        const embed = client.embed()
            .setColor(client.config.color)
            
            .setTitle(title)
            .setURL(uri)
            .setThumbnail(thumbnail)
            .addFields([
                {
                    name: 'Author',
                    value: `${await player.getArtist(this.client, player.queue.current)}`,
                    inline: true
                },
                {
                    name: 'Requester',
                    value: `${requester}`,
                    inline: true
                },
                {
                    name: 'Duration',
                    value: `${parsedCurrentDuration} / ${isStream ? '◉ LIVE' : parsedDuration}`,
                    inline: true
                },
                {
                    name: 'Progress Bar',
                    value: `${percentage < 0.05 ? client.config.emojis.progress7 : client.config.emojis.progress1}${client.config.emojis.progress2.repeat(part)}${percentage < 0.05 ? '' : client.config.emojis.progress3}${client.config.emojis.progress5.repeat(12 - part)}${client.config.emojis.progress6}`,
                }
            ])
        return intReply(interaction, { content: null, embeds: [embed] })
    }
}