const Command = require('../../structures/Command');
const { intReply } = require('../../handlers/functions');
const { EmbedBuilder } = require("discord.js")

module.exports = class TrebleBass extends Command {
    constructor(client) {
        super(client, {
            name: 'treblebass',
            description: {
                content: 'To enable/disable treblebass effect/filter to the player.',
                usage: 'treblebass',
                examples: ['treblebass']
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
        if(!interaction.replied) await interaction.deferReply().catch(() => {});
        let player = client.player.players.get(interaction.guildId);
        if (player.treblebass) {
            player.setTreblebass(false);
            const embed = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.success} Treblebass filter/effect is now **disabled**.`)
            return await intReply(interaction, ({ embeds: [embed] }));
        } else {
            player.setTreblebass(true);
            const embed1 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.success} Treblebass filter/effect is now **enabled**.`)
            return await intReply(interaction, ({ embeds: [embed1] }));
        };
    }
}