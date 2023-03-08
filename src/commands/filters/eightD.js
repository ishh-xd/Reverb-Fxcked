const Command = require('../../structures/Command');
const { intReply } = require('../../handlers/functions');
const { EmbedBuilder } = require("discord.js")

module.exports = class eightD extends Command {
    
    constructor(client) {
        super(client, {
            name: '8d',
            description: {
                content: 'To enable/disable 8D effect/filter',
                usage: '8d',
                examples: ['8d']
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
        if(!interaction.replied) await interaction.deferReply().catch(() => { });
        let player = client.player.players.get(interaction.guildId);
        if (player._8d) {
            player.set8D(false);
            const embed = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.success} 8D filter/effect is now **disabled**.`)
            return await intReply(interaction, ({ embeds: [embed] }));

        } else {
            player.set8D(true);
            const embed1 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.success} 8D filter/effect is now **enabled**.`)
            return await intReply(interaction, ({ embeds: [embed1] }));

        };
    }
}
