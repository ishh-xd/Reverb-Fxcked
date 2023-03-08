const Command = require('../../structures/Command');
const db = require("../../schemas/playlists");
const { EmbedBuilder } = require("discord.js")

module.exports = class AddNowplaying extends Command {
    constructor(client) {
        super(client, {
            name: 'pl-addcurrent',
            description: {
                content: 'To add the current playing song into the playlist.',
                usage: 'addcurrent <playlist name>',
                examples: ['addcurrent my playlist']
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

        let data = await db.findOne({ _id: interaction.user.id });
        const embed1 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.error} You don't have a any playlist data. \nUsage: ${client.config.cmdId.plc} \`<playlist name>.`)
        if (!data) return interaction.reply(({ embeds: [embed1] }));
        const embed2 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.error} You can't have more than 200 songs in a playlist.`)
        if (data.playlist.length >= 200) return await interaction.reply(({ embeds: [embed2] }));
        let player = client.player.players.get(interaction.guildId);

        const { title } = player.queue.current;
        data.playlist.push(title);
        await data.save();
        const embed3 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.success} Successfully added ${title} to **${playlistName}**.`)
        await interaction.reply(({ embeds: [embed3] }));
    }
}