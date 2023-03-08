const { CommandInteraction } = require('discord.js');
const { intReply } = require('../../handlers/functions');
const Command = require('../../structures/Command');
const { EmbedBuilder } = require("discord.js")

module.exports = class FixVoice extends Command {
    constructor(client) {
        super(client, {
            name: 'fixvoice',
            description: {
                content: 'Fixes voice region issues.',
                usage: '<prefix>fixvoice',
                examples: ['fixvoice']
            },
            category: 'general',
            cooldown: 3,
            permissions: {
                dev: false,
                client: ["SendMessages", "ViewChannel", "EmbedLinks"],
                user: ['ManageGuild']
            },
            player: {
                voice: true,
                dj: false,
                active: false,
                djPerm: null,
            },

        })
    }
    /**
     * 
     * @param {import('../../structures/Client').botClient} client 
     * @param {CommandInteraction} interaction 
     */
    async run(client, interaction) {
        if (!interaction.replied) await interaction.deferReply().catch(() => { });
        let player = client.player.players.get(interaction.guildId);

        if (!player) player = await client.player.createPlayer({
            guildId: interaction.guildId,
            textId: interaction.channelId,
            voiceId: interaction.member.voice.channelId,
            deaf: true,
            shardId: interaction.guild.shardId,
        });

        const voice = interaction.guild.channels.cache.get(player.voiceId);
        const embed = new EmbedBuilder()
        .setColor(client.config.color)
        .setDescription(`${client.config.emojis.error} I can't find the voice channel!`)
        if (!voice) return intReply(interaction, ({ embeds: [embed] }));
        if ('sydney' !== voice.rtcRegion) {
            await voice.edit({ rtcRegion: 'automatic' }).catch(() => { });
            const embed1 = new EmbedBuilder()
            .setColor(client.config.color)
            .setDescription(`${client.config.emojis.success} Your voice region has been set to Europe!`)
            return await intReply(interaction, ({ embeds: [embed1] }));
        } else {
            const embed2 = new EmbedBuilder()
            .setColor(client.config.color)
            .setDescription(`${client.config.emojis.error} I can't fix voice region at this moment, please try again later!`)
            return await intReply(interaction, ({ embeds: [embed2] }));

        }
    }
}

