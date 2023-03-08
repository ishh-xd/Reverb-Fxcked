const Command = require('../../structures/Command');
const { invalidArgs, updateQueue, intReply } = require('../../handlers/functions');
const { EmbedBuilder } = require("discord.js");

module.exports = class Remove extends Command {
    constructor(client) {
        super(client, {
            name: 'remove',
            description: {
                content: 'To remove a song from the queue.',
                usage: 'remove <song position> | remove <user> | remove dupes',
                examples: ['remove 2', 'remove @user', 'remove dupes']
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
            slashCommand: true,
            options: [
                {
                    name: 'track',
                    description: 'The position of the track you want to remove.',
                    type: 1,
                    options: [
                        {
                            name: 'position',
                            description: 'The position of the track you want to remove.',
                            type: 4,
                            required: true,
                        },
                    ],
                },
                {
                    name: 'user',
                    description: 'The user whose track you want to remove.',
                    type: 1,
                    options: [
                        {
                            name: 'user',
                            description: 'The user whose track you want to remove.',
                            type: 6,
                            required: true,
                        },
                    ],
                },
                {
                    name: "dupes",
                    description: "To remove dupes from the queue.",
                    type: 1,
                }
            ],
        })
    }
    async run(client, interaction) {
        if(!interaction.replied) await interaction.deferReply().catch(() => { });
        const player = client.player.players.get(interaction.guildId);
        let user = interaction.guild.members.cache.get(interaction.options.getMember('user')?.id);
        let cmd = interaction.options.data[0].name;
        let position = interaction.options.getInteger('position')
        if (cmd === 'track') {
            const embed = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.error} There are no tracks in the queue.`)
            if (!player.queue.length) return await intReply(interaction, ({ embeds: [embed] }));
            const embed1 = new EmbedBuilder()
            .setColor(client.config.color)
            .setDescription(`${client.config.emojis.error} Please provide a valid track position.`)
            if (!position) return await intReply(interaction, ({ embeds: [embed1] }));


            let trackNumber = parseInt(position);
            const embed2 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.error} Please provide a valid track position.`)
            if (isNaN(trackNumber)) return await intReply(interaction, ({ embeds: [embed2] }));
            const embed3 = new EmbedBuilder()
            .setColor(client.config.color)
            .setDescription(`${client.config.emojis.error} Track number shouldn't be lower than or equal to 0.`)
            if (trackNumber <= 0) return await intReply(interaction, ({ embeds: [embed3] }));
            const embed4 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.error} Track number shouldn't be greater than the queue size.`)
            if (trackNumber > player.queue.length) return await intReply(interaction, ({ embeds: [embed4] }));

            player.queue.splice(trackNumber - 1, 1);
            await updateQueue(client, player, interaction.guild);
            const embed5 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.success} Removed track number **${trackNumber}** from the queue.`)
            await intReply(interaction, ({ embeds: [embed5] }));

        } else if (cmd === 'user') {
            const embed6 = new EmbedBuilder()
            .setColor(client.config.color)
            .setDescription(`${client.config.emojis.error} There are no tracks in the queue.`)
            if (!player.queue.length) return await intReply(interaction, ({ embeds: [embed6] }));
            const embed7 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.error} Please provide a user.`)

            if (!user) return await intReply(interaction, ({ embeds: [embed7] }));

            let count = 0;
            let queue = [];

            for (const track of player.queue) {
                if (track.requester && track.requester.id !== user.id) {
                    queue.push(track);
                } else {
                    ++count;
                };
            };

            const embed8 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.error} There are no songs in the queue from that user.`)
            if (count <= 0) return await intReply(interaction, ({ embeds: [embed8] }));

            if (queue.length <= 0) {
                player.queue.clear();
                const embed9 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.success} Removed **${count}** track(s) requested by <@${user.id}> from the queue.`)
                return await intReply(interaction, ({ embeds: [embed9] }));
            }

            player.queue.clear();
            player.queue.add(queue);
            await updateQueue(client, player, interaction.guild);
            const embed10 = new EmbedBuilder()
            .setColor(client.config.color)
            .setDescription(`${client.config.emojis.success} Removed **${count}** track(s) requested by <@${user.id}> from the queue.`)
            await intReply(interaction, ({ embeds: [embed10] }));

        } else if (cmd === 'dupes') {
            const embed11 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.error} There are no tracks in the queue.`)
            if (!player.queue.length) return await intReply(interaction, ({ embeds: [embed11] }));

            const notDuplicatedTracks = [];
            let duplicatedTracksCount = 0;

            for (let i of player.queue) {
                if (notDuplicatedTracks.length <= 0) notDuplicatedTracks.push(i);
                else {
                    let j = notDuplicatedTracks.find((x) => x.title === i.title || x.uri === i.uri);
                    if (!j) notDuplicatedTracks.push(i);
                    else ++duplicatedTracksCount;
                };
            };
            const embed12 = new EmbedBuilder()
            .setColor(client.config.color)
            .setDescription(`${client.config.emojis.error} There are no duplicated tracks in the queue to remove.`)
            if (duplicatedTracksCount <= 0) return await intReply(interaction, ({ embeds: [embed12] }));

            player.queue.clear();
            player.queue.add(notDuplicatedTracks);
            await updateQueue(client, player, interaction.guild);
            const embed13 = new EmbedBuilder()
            .setColor(client.config.color)
            .setDescription(`${client.config.emojis.success} Removed **${duplicatedTracksCount}** duplicated track(s) from the queue.`)
            await intReply(interaction, ({ embeds: [embed13] }));
        } else return await invalidArgs("remove", interaction, "Please provide a valid sub command.", client);
    }
}