const Command = require('../../structures/Command');
const { moveArray, invalidArgs, intReply } = require("../../handlers/functions");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class Move extends Command {
    constructor(client) {
        super(client, {
            name: 'move',
            description: {
                content: 'Moves a song from one position to another.',
                usage: 'move <song position> <bot> <user>',
                examples: ["move track 4 1", "move me", "move bot"]
            },
            category: 'music',
            cooldown: 6,
            player: {
                voice: false,
                dj: true,
                active: false,
                djPerm: ['DeafenMembers', 'MoveMembers'],
            },
            permissions: {
                dev: false,
                client: ["SendMessages", "ViewChannel", "EmbedLinks", "Connect", "Speak", "MoveMembers"],
                user: [],
            },
            options: [
                {
                    name: "track",
                    description: "To move a track to new position in the queue.",
                    type: 1,
                    options: [
                        {
                            name: 'song_position',
                            description: 'The position of the song you want to move.',
                            type: 4,
                            required: true,
                        },
                        {
                            name: 'new_position',
                            description: 'The position you want to move the song to.',
                            type: 4,
                            required: true,
                        },
                    ]
                },

                {
                    name: "bot",
                    description: "To move the bot to your voice channel.",
                    type: 1
                },

                {
                    name: "me",
                    description: "To move you to the voice channel that the bot's in.",
                    type: 1
                }
            ],
        })
    }
    async run(client, interaction) {
        if(!interaction.replied) await interaction.deferReply().catch(() => { });
        const player = client.player.players.get(interaction.guildId);
        const embed = client.embed().setColor(client.config.color).setDescription(`${client.config.emojis.error} There is no player in this server.`);

        if (!player) return await intReply(interaction, {embeds: [embed]}).catch(() => { });

       
        let cmd = interaction.options.data[0].name;
        let pos = interaction.options.getInteger("song_position");
        let pos2 = interaction.options.getInteger("new_position");
        
        if (cmd === "track") {
            const embed1 = client.embed().setColor(client.config.color).setDescription(`${client.config.emojis.error} Please provide a valid position.`);
            const embed2 = client.embed().setColor(client.config.color).setDescription(`${client.config.emojis.error} There is no queue.`);
            const embed3 = client.embed().setColor(client.config.color).setDescription(`${client.config.emojis.error} There is no song playing.`);
            const embed4 = client.embed().setColor(client.config.color).setDescription(`${client.config.emojis.error} There is no song in the queue.`);

            if (!pos || !pos2) return await intReply(interaction, {embeds: [2]}).catch(() => { });
            if (!player.queue) return await intReply(interaction, {embeds: [embed2]}).catch(() => { });
            if (!player.queue.current) return await intReply(interaction, {embeds: [embed3]}).catch(() => { });
            if (!player.queue.length) return await intReply(interaction, {embeds: [embed4]}).catch(() => { });

            const embed5 = client.embed().setColor(client.config.color).setDescription(`${client.config.emojis.error} Please provide a valid song position.`);
            if (isNaN(pos && pos2)) return await intReply(interaction, {embeds: [embed5]}).catch(() => { });

            const embed6 = client.embed().setColor(client.config.color).setDescription(`${client.config.emojis.error} You've provided an invalid track position to move.`);

            if (pos <= 0 || pos > player.queue.length) return await intReply(interaction, {embeds: [embed6]}).catch(() => { });

            const embed7 = client.embed().setColor(client.config.color).setDescription(`You've provided an invalid position to move the track.`);

            if (pos2 <= 0 || pos2 > player.queue.length) return await intReply(interaction, {embeds: [embed7]}).catch(() => { });

            const embed8 = client.embed().setColor(client.config.color).setDescription(`This track is already at the position **${pos2}**`);

            if (pos === pos2) return await intReply(interaction, {embeds: [embed8]}).catch(() => { });

            pos = pos - 1;
            pos2 = pos2 - 1;

            const movedQueue = moveArray(player.queue, pos, pos2);
            player.queue.clear();
            player.queue.add(movedQueue);
            const embed9 = client.embed().setColor(client.config.color).setDescription(`${client.config.emojis.success} Moved track number **${pos + 1}** to **${pos2 + 1}** in the queue.`);

            return await intReply(interaction, {embeds: [embed9]}).catch(() => { });
        } else if (cmd === "bot") {
            const embed10 = client.embed().setColor(client.config.color).setDescription(`${client.config.emojis.error} You don't have the \`Move Members\` permission to use this command.`);

            if (!interaction.member.permissions.has(PermissionFlagsBits.MoveMembers)) return await intReply(interaction, {embeds: [embed10]}).catch(() => { });
            const embed11 = client.embed().setColor(client.config.color).setDescription(`${client.config.emojis.error} I'm already in your voice channel.`);

            if (interaction.guild.members.me.voice.channel && interaction.guild.members.me.voice.channelId === interaction.member.voice.channelId) return await intReply(interaction, {embeds: [embed11]}).catch(() => { });

            player.setVoiceChannel(interaction.member.voice.channelId);
            if (player.voiceChannel !== interaction.member.voice.channelId) player.changeVoiceChannel(interaction.member.voice.channelId);
            if (player.paused) player.pause(false);
            const embed12 = client.embed().setColor(client.config.color).setDescription(`${client.config.emojis.success} Moved to your voice channel <#${player.voiceId}>.`);

            return await intReply(interaction, {embeds: [embed12]}).catch(() => { });
        } else if (cmd === "me") {
            const embed13 = client.embed().setColor(client.config.color).setDescription(`${client.config.emojis.error} You are already connected to the same channel as I am.`);

            if (interaction.member.voice.channel && interaction.member.voice.channelId === interaction.guild.members.me.voice.channelId) return await intReply(interaction, {embeds: [embed13]}).catch(() => { });
            const embed14 = client.embed().setColor(client.config.color).setDescription(`${client.config.emojis.error} I don't have the \`Move Members\` permission to use this command.`);

            if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.MoveMembers)) return await intReply(interaction, {embeds: [embed14]}).catch(() => { });

            await interaction.member.voice.setChannel(interaction.guild.members.me.voice.channel);
            const embed15 = client.embed().setColor(client.config.color).setDescription(`${client.config.emojis.success} Moved you to ${interaction.guild.members.me.voice.channel}.`);

            return await intReply(interaction, {embeds: [embed15]}).catch(() => { });
        } else return await invalidArgs("move", interaction, "Please provide a valid sub command.", client);;
    }
}