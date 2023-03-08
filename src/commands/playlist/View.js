const Command = require('../../structures/Command');
const db = require("../../schemas/playlists");
const { convertTime } = require("../../utils/convert");
const { paginate } = require('../../handlers/functions');;
const { EmbedBuilder } = require("discord.js")

module.exports = class View extends Command {
    constructor(client) {
        super(client, {
            name: 'pl-view',
            description: {
                content: 'To view a playlist',
                usage: 'view <playlist name>',
                examples: ['view my playlist']
            },
            voteReq: true,
            category: 'playlist',
            cooldown: 6,
            player: {
                voice: false,
                dj: false,
                active: false,
                djPerm: ["DeafenMembers"],
            },
            permissions: {
                dev: false,
                client: ["SendMessages", "ViewChannel", "EmbedLinks", "Connect", "Speak"],
                user: [],
            },
            options: [
                {
                    name: 'name',
                    type: 3,
                    required: true,
                    description: 'The playlist\'s name.',
                    max_length: 20,
                    autocomplete: true,
                }
            ],
        });
    }
    async run(client, interaction) {
        const name = interaction.options.getString('name');
        const embed = new EmbedBuilder()
        .setColor(client.config.color)
        .setDescription(`${client.config.emojis.error} Playlist name must be less than ${this.options[0].max_length} characters!`)
        if (name.length > this.options[0].max_length) return interaction.reply(({ embeds: [embed] }));

        const playlistName = name.replace(/_/g, ' ');

        let data = await db.findOne({ _id: interaction.user.id, playlistName: playlistName });
        const embed1 = new EmbedBuilder()
        .setColor(client.config.color)
        .setDescription(`${client.config.emojis.error} You don't have a any playlist data. \nUsage: ${client.config.cmdId.plc} \`<playlist name>.`)
        if (!data) return interaction.reply(({ embeds: [embed1] }));
        const embed2 = new EmbedBuilder()
        .setColor(client.config.color)
        .setDescription(`${client.config.emojis.error} You don't have any songs in the playlist \`${playlistName}\`.`)
        if (data.playlist.length <= 0) return interaction.reply(({ embeds: [embed2] }));

        let pagesNum = Math.ceil(data.playlist.length / 10);
        if (pagesNum === 0) pagesNum = 1;

        let totalQueueDuration = 0;
        for (let i = 0; i < data.playlist.length; i++) {
            totalQueueDuration += data.playlist[i].length;
        }

        const pages = [];
        let n = 1;
        for (let i = 0; i < pagesNum; i++) {
            const str = `${data.playlist.slice(i * 10, i * 10 + 10).map(song => `**${n++}.** [${song.title}](${song.uri}) \`[${convertTime(song.length)}]\``).join('\n')}`;

            const embed = client.embed()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setThumbnail(interaction.user.displayAvatarURL())
                .setTitle(data.playlistName)
                .setDescription(str)
                .setColor(client.config.color)
                .setFooter({ text: `Page ${i + 1}/${pagesNum} | ${data.playlist.length} songs | ${convertTime(totalQueueDuration)} total duration` });
            pages.push(embed);
        }
         paginate(client, interaction, pages);
    }
}