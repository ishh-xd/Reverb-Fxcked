const { intReply } = require('../../handlers/functions');
const Command = require('../../structures/Command');
const { EmbedBuilder } = require("discord.js")

module.exports = class bass extends Command {
    constructor(client) {
        super(client, {
            name: 'bass',
            description: {
                content: 'To enable/disable bassboost filter',
                usage: 'bass',
                examples: ['bass']
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
        if (player.bass) {
            player.setBass(false);
            const embed = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.success} Bassboost filter/effect is now **disabled**.`)
            return await intReply(interaction, ({ embeds: [embed] }));
        } else {
            player.setBass(true);
            const embed1 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.success} Bassboost filter/effect is now **enabled**.`)
            return await intReply(interaction, ({ embeds: [embed1] }));
        };
    }
}