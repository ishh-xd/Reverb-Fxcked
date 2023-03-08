const Command = require('../../structures/Command');
const db = require("../../schemas/playlists");
const { EmbedBuilder } = require("discord.js")

module.exports = class AddQueue extends Command {
    constructor(client) {
        super(client, {
            name: 'pl-addqueue',
            description: {
                content: 'To add an entire queue into a playlist.',
                usage: 'add <playlist name>',
                examples: ['add my playlist']
            },
            voteReq: true,
            category: 'playlist',
            cooldown: 6,
            player: {
                voice: false,
                dj: false,
                active: true,
                djPerm: ["DeafenMembers"],
            },
            permissions: {
                dev: false,
                client: ["SendMessages", "ViewChannel", "EmbedLinks", "Connect", "Speak"],
                user: [],
            },
            slashCommand: true,
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

        let data = await db.findOne({ _id: interaction.user.id });
        const embed1 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.error} You don't have a any playlist data. \nUsage: ${client.config.cmdId.plc}  \`<playlist name>.`)
        if (!data) return interaction.reply(({ embeds: [embed1] }));
        const embed2 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.error} You can't have more than 200 songs in a playlist.`)
        if (data.playlist.length >= 200) return await interaction.reply(({ embeds: [embed2] }));
        let player = client.player.players.get(interaction.guildId);

        for (const track of player.queue.map((x) => x)) data.playlist.push(track);
        await data.save();
        const embed3 = new EmbedBuilder()
        .setColor(client.config.color)
        .setDescription(`${client.config.emojis.success} Successfully added **${player.queue.length}** track(s) to **${playlistName}**`)
        await interaction.reply(({ embeds: [embed3] }));
    }
}