const Command = require('../../structures/Command');
const db = require("../../schemas/playlists");
const { EmbedBuilder } = require("discord.js")

module.exports = class Remove extends Command {
    constructor(client) {
        super(client, {
            name: 'pl-remove',
            description: {
                content: 'To remove a song from a playlist.',
                usage: 'remove <playlist name> <song number>',
                examples: ['remove my playlist 1']
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
                    autocomplete: true,
                },
                {
                    name: 'song',
                    type: 3,
                    required: true,
                    description: 'The song\'s number.',
                }
            ],
        });
    } 
    async run(client, interaction) {
        const name = interaction.options.getString('name');
        const song = interaction.options.getString('song');
        const embed = new EmbedBuilder()
        .setColor(client.config.color)
        .setDescription(`${client.config.emojis.error} Please specify the position of the song you want to remove.\nUsage: ${client.config.cmdId.plr} \`<playlist name> <song position>\``)
        if (!song || isNaN(song)) return interaction.reply(({ embeds: [embed] }));
        const playlistName = name.replace(/_/g, ' ');
      
        let data = await db.findOne({ _id: interaction.user.id, playlistName: playlistName });
        if(!data) {
            const embed2 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.error} You don't have a any playlist data. \nUsage: ${client.config.cmdId.plc} \`<playlist name>.`)
            return interaction.reply(({ embeds: [embed2] }));
        } else {
            const embed3 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.error} The playlist doesn't have that many songs.`)
            if (data.playlist.length < song) return interaction.reply(({ embeds: [embed3] }));
            data.playlist.splice(song- 1, 1);
            await data.save();
            const embed4 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.success} Successfully removed track **${song}** from your playlist **${playlistName}**`)
            return interaction.reply(({ embeds: [embed4] }));
        }
    }
}       