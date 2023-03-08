const Command = require('../../structures/Command');
const { intReply } = require('../../handlers/functions');
const { EmbedBuilder } = require("discord.js")

module.exports = class earrape extends Command {
    constructor(client) {
        super(client, {
            name: 'earrape',
            description: {
                content: 'To enable/disable earrape effect/filter',
                usage: 'earrape',
                examples: ['earrape']
            },
            voteReq: true,
            category: 'filters',
            cooldown: 6,
            player: {
                voice: true,
                dj: true,
                active: true,
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
        if (!interaction.replied) await interaction.deferReply().catch(() => { });
        let player = client.player.players.get(interaction.guildId);
        if (player.earrape) {
            player.setEarrape(false);
            const embed = new EmbedBuilder()
            .setColor(client.config.color)
            .setDescription(`${client.config.emojis.success} Earrape filter/effect is now **disabled**.`)
            return await intReply(interaction, ({ embeds: [embed] }));

        } else {
            player.setEarrape(true);
            const embed1 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.success} Earrape filter/effect is now **enabled**.`)
            return await intReply(interaction, ({ embeds: [embed1] }));

        };
    }
}