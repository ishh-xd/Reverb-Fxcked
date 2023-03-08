const Command = require("../../structures/Command");
const db = require("../../schemas/playlists");
const { EmbedBuilder } = require("discord.js")

module.exports = class Dupes extends Command {
    constructor(client) {
        super(client, {
            name: "pl-dupes",
            description: {
                content: "To remove duplicate songs from a playlist.",
                usage: "dupes <playlist name>",
                examples: ["dupes my playlist"]
            },
            voteReq: true,
            category: "playlist",
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
            slashCommand: true,
            options: [
                {
                    name: "name",
                    type: 3,
                    required: true,
                    description: "The playlist's name.",
                    max_length: 20,
                    autocomplete: true,
                },
            ],
        });
    }
    async run(client, interaction) {
        const name = interaction.options.getString('name');
        const playlistName = name.replace(/_/g, " ");
        let data = await db.findOne({ _id: interaction.user.id, playlistName: playlistName });
        let count = 0;
        if (!data) {
            const embed = new EmbedBuilder()
            .setColor(client.config.color)
            .setDescription(`${client.config.emojis.error} You don't have any playlist data. \nUsage: ${client.config.cmdId.plc} \`<playlist name>.`)
            return interaction.reply(({ embeds: [embed] }));
        } else {
            let dupes = [];
            for (let i = 0; i < data.playlist.length; i++) {
                for (let j = i + 1; j < data.playlist.length; j++) {
                    if (data.playlist[i].title === data.playlist[j].title) {
                        dupes.push(data.playlist[i]); 
                        count++;
                    } 
                } 
            }
            const embed1 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.error} No duplicate songs found.`)
            if(count <= 0) return interaction.reply(({ embeds: [embed1] }));

            for (let i = 0; i < dupes.length; i++) {
                data.playlist.splice(data.playlist.indexOf(dupes[i]), 1);
            } 
            await data.save();
            const embed2 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.success} Successfully removed duplicate songs from your playlist **${playlistName}**`)
            return interaction.reply(({ embeds: [embed2] }));
        }
    } 
}