const Command = require('../../structures/Command');
const { updateQueue, invalidArgs, intReply } = require("../../handlers/functions");

module.exports = class Loop extends Command {
    constructor(client) {
        super(client, {
            name: 'loop',
            description: {
                content: 'Loops the current song or queue.',
                usage: 'loop <song/queue>',
                examples: ['loop song', 'loop queue']
            },
            category: 'music',
            voteReq: true,
            cooldown: 6,
            player: {
                voice: true,
                dj: true,
                active: true,
                djPerm: ['DeafenMembers'],
            },
            permissions: {
                dev: false,
                client: ["SendMessages", "ViewChannel", "EmbedLinks", "Connect", "Speak"],
                user: [],
            },
            options: [
                {
                    name: 'type',
                    description: 'The type of loop to enable.',
                    type: 3,
                    required: true,
                    choices: [
                        {
                            name: 'Track',
                            value: 'track',
                        },
                        {
                            name: 'Queue',
                            value: 'queue',
                        },
                    ],
                },
            ],
        })
    }
    async run(client, interaction) {
        if (!interaction.replied) await interaction.deferReply().catch(() => { });
        const player = client.player.players.get(interaction.guildId);
        const args = interaction.options.getString('type');
        if (args === 'track') {
            if (player.loop === 'track') {
                player.setLoop('none');
                await updateQueue(client, player, interaction.guild);
                const embed = client.embed().setColor(client.config.color).setDescription(`${client.config.emojis.success} Disabled track loop.`);
                return await intReply(interaction, {embeds: [embed]}).catch(() => { });
            } else {
                player.setLoop('track');
                await updateQueue(client, player, interaction.guild);
                const embed1 = client.embed().setColor(client.config.color).setDescription(`${client.config.emojis.success} Enabled track loop.`);
                return await intReply(interaction, {embeds: [embed1]}).catch(() => { });
            }
        } else if (args === 'queue') {
            if (player.loop === 'queue') {
                player.setLoop('none');
                await updateQueue(client, player, interaction.guild);
                
                const embed2 = client.embed().setColor(client.config.color).setDescription(`${client.config.emojis.success} Disabled queue loop.`);
                return await intReply(interaction, {embeds: [embed2]}).catch(() => { });
            } else {
                player.setLoop('queue');
                await updateQueue(client, player, interaction.guild);
                const embed3 = client.embed().setColor(client.config.color).setDescription(`${client.config.emojis.success} Enabled queue loop.`);
                return await intReply(interaction, {embeds: [embed3]}).catch(() => { });
            }
        } else return await invalidArgs("loop", interaction, "Please provide a valid sub command.", client);

    }
}