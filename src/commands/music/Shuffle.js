const Command = require('../../structures/Command');
const { updateQueue, intReply } = require("../../handlers/functions");
const { EmbedBuilder } = require("discord.js")

module.exports = class Shuffle extends Command {
    constructor(client) {
        super(client, {
            name: 'shuffle',
            description: {
                content: 'To shuffle the queue.',
                usage: 'shuffle',
                examples: ['shuffle']
            },
            category: 'music',
            voteReq: true,
            cooldown: 3,
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
            slashCommand: true,
            options: [],
        });
    }

    async run(client, interaction) {
        if(!interaction.replied) await interaction.deferReply().catch(() => { });
        const player = client.player.players.get(interaction.guildId);
        const embed = new EmbedBuilder()
        .setColor(client.config.color)
        .setDescription(`${client.config.emojis.error} There are insufficient songs in the queue to shuffle.`)
        if (!player.queue.length) return await intReply(interaction, ({ embeds: [embed] }));
        const embed1 = new EmbedBuilder()
        .setColor(client.config.color)
        .setDescription(`${client.config.emojis.error} Shuffle is already enabled in the queue.`)
        if(player.shuffle) return await intReply(interaction, ({ embeds: [embed1] }));
        player.setShuffle();
        await updateQueue(client, player, interaction.guild);
        const embed2 = new EmbedBuilder()
        .setColor(client.config.color)
        .setDescription(`${client.config.emojis.success} Shuffled the queue.`)
        return await intReply(interaction, ({ embeds: [embed2] }));
    }
}