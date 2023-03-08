const Command = require('../../structures/Command');
const { intReply } = require('../../handlers/functions');
const { EmbedBuilder } = require("discord.js")

module.exports = class Vaporwave extends Command {
    constructor(client) {
        super(client, {
            name: 'vaporwave',
            description: {
                content: 'To enable/disable vaporwave effect/filter to the player.',
                usage: 'vaporwave',
                examples: []
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
        if( !interaction.replied ) await interaction.deferReply().catch(() => {});
        let player = client.player.players.get(interaction.guildId);
        if (player.vaporwave) {
            player.setVaporwave(false);
            const embed = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.success} Vaporwave filter/effect is now **disabled**.`)
            return await intReply(interaction, ({ embeds: [embed] }));
        } else {
            player.setVaporwave(true);
            const embed1 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.success} Vaporwave filter/effect is now **enabled**.`)
            return await intReply(interaction, ({ embeds: [embed1] }));
        }
    }       
}