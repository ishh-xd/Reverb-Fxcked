const Command = require('../../structures/Command');
const { updateQueue, intReply } = require("../../handlers/functions");
const { EmbedBuilder } = require("discord.js")

module.exports = class Unshuffle extends Command {
    constructor(client) {
        super(client, {
            name: 'unshuffle',
            description: {
                content: 'To unshuffle the queue.',
                usage: 'unshuffle',
                examples: ['unshuffle']
            },
            category: 'music',
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
        });
    }

    async run(client, interaction) {
        if (!interaction.replied) await interaction.deferReply().catch(() => { });
        const player = client.player.players.get(interaction.guildId);
        const embed = new EmbedBuilder()
        .setColor(client.config.color)
        .setDescription(`${client.config.emojis.error} The queue has already been unshuffled.`)
        if (player.unshuffle) return await intReply(interaction, ({ embeds: [embed] }));
        player.setUnshuffle()
        await updateQueue(client, player, interaction.guild);
        const embed1 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.success} Unshuffled the queue.`)
        return await intReply(interaction, ({ embeds: [embed1] }));
    }
}