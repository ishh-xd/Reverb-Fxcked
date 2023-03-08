const Command = require('../../structures/Command');
const { updateQueue, intReply } = require("../../handlers/functions");
const { EmbedBuilder } = require("discord.js")

module.exports = class Resume extends Command {
    constructor(client) {
        super(client, {
            name: 'resume',
            description: {
                content: 'To resume the current paused song.',
                usage: 'resume',
                examples: ['resume']
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
        })
    }
    async run(client, interaction) {
        if(!interaction.replied) await interaction.deferReply().catch(() => { });
        const player = client.player.players.get(interaction.guildId);
        const embed = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.error} The player is not paused.`)
        if(!player.paused) return await intReply(interaction, ({ embeds: [embed] }));
        const { title } = player.queue.current;
        player.pause(false);
        await updateQueue(client, player, interaction.guild);
        const embed1 = new EmbedBuilder()
        .setColor(client.config.color)
        .setDescription(`${client.config.emojis.success} Resumed [${player.queue.current.title}](${player.queue.current.uri})`)
        await intReply(interaction, ({ embeds: [embed1] }));
    }
}