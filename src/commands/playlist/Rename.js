const Command = require('../../structures/Command');
const db = require("../../schemas/playlists");
const { EmbedBuilder } = require("discord.js")

module.exports = class Rename extends Command {
    constructor(client) {
        super(client, {
            name: 'pl-rename',
            description: {
                content: 'To rename your playlist',
                usage: 'rename <playlist name> <new playlist name>',
                examples: ['pl-rename my playlist my epic playlist']
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
                    name: 'current',
                    type: 3,
                    required: true,
                    description: 'The playlist\'s current name.',
                    max_length: 100,
                    autocomplete: true,
                },
                {
                    name: 'new',
                    type: 3,
                    required: true,
                    description: 'The playlist\'s new name.',
                    max_length: 100,
                },

            ],
        });
    }
    async run(client, interaction) {
        const current = interaction.options.getString('current');
        const newName = interaction.options.getString('new');
        const embed = new EmbedBuilder()
        .setColor(client.config.color)
        .setDescription(`${client.config.emojis.error} Please specify a playlist name.\nUsage: ${client.config.cmdId.plr} \`<playlist name> <new playlist name>\``)
        if (!newName) return interaction.reply(({ embeds: [embed] }));
        if (current.length > this.options[0].max_length) return interaction.reply(`${client.config.emojis.error} Playlist name must be less than ${this.options[0].max_length} characters!`);
       
        const playlistName = current.replace(/_/g, ' ');
        const newPlaylistName = newName.replace(/_/g, ' ');

        let data = await db.findOne({ _id: interaction.user.id, playlistName: playlistName });
        const embed1 = new EmbedBuilder()
        .setColor(client.config.color)
        .setDescription(`${client.config.emojis.error} You don't have any playlist data. \nUsage: ${client.config.cmdId.plc} \`<playlist name>.`)
        if (!data) return interaction.reply(({ embeds: [embed1] }));
        if (data.playlistName) {
            data.playlistName = newPlaylistName;
            await data.save();
            const embed2 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.success} Successfully renamed **${playlistName}** to **${newPlaylistName}**.`)
            return interaction.reply(({ embeds: [embed2] }));
        }
    }
}