const Command = require('../../structures/Command');
const { intReply } = require('../../handlers/functions');
const { EmbedBuilder } = require("discord.js")

module.exports = class bassboost extends Command {
    constructor(client) {
        super(client, {
            name: 'bassboost',
            description: {
                content: 'To enable/disable bassboost effect/filter',
                usage: 'bassboost',
                examples: ['bassboost']
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
            options: [
                {
                    name: "level",
                    description: "The bassboost level.",
                    type: 3,
                    required: true,
                    choices: [
                        {
                            name: "none",
                            value: "none"
                        },

                        {
                            name: "low",
                            value: "low"
                        },

                        {
                            name: "medium",
                            value: "medium"
                        },

                        {
                            name: "high",
                            value: "high"
                        }
                    ]
                }
            ]
        });
    }
    async run(client, interaction) {
        if (!interaction.replied) await interaction.deferReply().catch(() => { });
        let player = client.player.players.get(interaction.guildId);
        const level = interaction.options.getString("level");
        switch (level) {
            case "none":
                const embed = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.error} Bassboost filter/effect is already set to **${level}**`)
                if (player.bassboostLevel === level) return await intReply(interaction, ({ embeds: [embed] }));
                player.setBassboost("none");
                const embed1 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.success} Bassboost filter/effect is now set to **${level}**`)
                await intReply(interaction, ({ embeds: [embed1] }));
                break;
            case "low":
                const embed2 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.error} Bassboost filter/effect is already set to **${level}**`)
                if (player.bassboostLevel === level) return await intReply(interaction, ({ embeds: [embed2] }));
                player.setBassboost("low");
                const embed3 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.success} Bassboost filter/effect is now set to **${level}**`)
                await intReply(interaction, ({ embeds: [embed3] }));
                break;
            case "medium":
                const embed4 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.error} Bassboost filter/effect is already set to **${level}**`)
                if (player.bassboostLevel === level) return await intReply(interaction, ({ embeds: [embed4] }));

                player.setBassboost("medium");
                const embed5 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.success} Bassboost filter/effect is now set to **${level}**`)
                await intReply(interaction, ({ embeds: [embed5] }));

                break;
            case "high":
                const embed6 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.error} Bassboost filter/effect is already set to **${level}**`)
                if (player.bassboostLevel === level) return await intReply(interaction, ({ embeds: [embed6] }));
                player.setBassboost("high");
                const embed7 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.success} Bassboost filter/effect is now set to **${level}**`)
                await intReply(interaction, ({ embeds: [embed7] }));
                break;
        }
    }
}
