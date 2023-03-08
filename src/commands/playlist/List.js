const Command = require('../../structures/Command');
const db = require("../../schemas/playlists");
const { EmbedBuilder } = require("discord.js")

module.exports = class List extends Command {
    constructor(client) {
        super(client, {
            name: 'pl-list',
            description: {
                content: 'To list all of your playlists.',
                usage: 'list',
                examples: ['list']
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
        });
    }
    async run(client, interaction) {

        let data = await db.find({ _id: interaction.user.id });

        if (!data) return interaction.reply(`${client.config.emojis.error} You don't have a any playlist data. \nUsage: ${client.config.cmdId.plc} \`<playlist name>.`);

        let pagesNum = Math.ceil(data.length / 10);
        if (pagesNum === 0) pagesNum = 1;

        let n = 1;
        for (let i = 0; i < pagesNum; i++) {
            const str = `${data.slice(i * 10, i * 10 + 10).map(x => `${n++}. **${x.playlistName}** - total tracks: **${x.playlist.length}**`).join('\n')}`;

            const embed = client.embed()
                .setAuthor({ name: `${interaction.user.username}'s Playlists`, iconURI: interaction.user.displayAvatarURL() })
                .setThumbnail(interaction.user.displayAvatarURL())
                .setDescription(str)
                .setColor(client.config.color)
                .setFooter({ text: `Page ${i + 1}/${pagesNum} | ${data.length}` });
            await interaction.reply({ embeds: [embed] });
        }   
    }
}
