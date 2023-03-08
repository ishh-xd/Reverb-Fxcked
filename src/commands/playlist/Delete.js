const Command = require('../../structures/Command');
const db = require("../../schemas/playlists");
const { EmbedBuilder } = require("discord.js")

module.exports = class Delete extends Command {
    constructor(client) {
        super(client, {
            name: 'pl-delete',
            description: {
                content: 'To delete a playlist.',
                usage: 'delete <playlist name>',
                examples: ['delete my playlist']
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
        const playlistName = name.replace(/_/g, ' ');
        let data = await db.findOne({ _id: interaction.user.id, playlistName: playlistName });
        if(data) {
            await data.delete();
            const embed = new EmbedBuilder()
            .setColor(client.config.color)
            .setDescription(`${client.config.emojis.success} Successfully deleted the playlist **${playlistName}**`)
            return interaction.reply(({ embeds: [embed] }));
        } else {
            const embed1 = new EmbedBuilder()
            .setColor(client.config.color)
            .setDescription(`${client.config.emojis.error} You don't have any playlist with the name **${playlistName}**`)
            return interaction.reply(({ embeds: [embed1] }));

        }
    }
}