const Command = require('../../structures/Command');
const db = require("../../schemas/playlists");
const { EmbedBuilder } = require("discord.js")

module.exports = class Create extends Command {
    constructor(client) {
        super(client, {
            name: 'pl-create',
            description: {
                content: 'To create a playlist.',
                usage: 'playlist-create <playlist name>',
                examples: ['playlist-create my playlist']
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
                }
            ],

        });
    }
    async run(client, interaction) {
        const name = interaction.options.getString('name');
        let playlistName = name.replace(/_/g, ' ');
        const embed = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.error} The playlist name must be less than ${this.options[0].max_length} characters.`)
        if (name.length > this.options[0].max_length) return interaction.reply(({ embeds: [embed] }));
        let data = await db.find({ _id: interaction.user.id, playlistName: playlistName });

        let userData = db.find({
            _id: interaction.user.id
        });
        const embed1 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.error} You have reached the maximum number of playlists you can create,     Delete some of your playlists to create more.`)
        if (userData.length > 10) return interaction.reply(({ embeds: [embed1] }));
        if (data.length > 0) {
            const embed2 = new EmbedBuilder()
            .setColor(client.config.color)
            .setDescription(`${client.config.emojis.error} You already have a playlist with the name **${playlistName}**.`)
            return interaction.reply(({ embeds: [embed2] }));
        } else {
            data = new db({
                _id: interaction.user.id,
                playlistName: playlistName,
                userName: interaction.user.username,
                createdOn: Math.round(Date.now() / 1000)
            });
            await data.save();
            const embed3 = new EmbedBuilder()
            .setColor(client.config.color)
            .setDescription(`${client.config.emojis.success} Successfully created a playlist for you named **${playlistName}**`)
            await interaction.reply(({ embeds: [embed3] }));
        }
    }
}