const Command = require('../../structures/Command');
const db = require('../../schemas/setup');
const { EmbedBuilder } = require("discord.js")

module.exports = class Clean extends Command {
    constructor(client) {
        super(client, {
            name: 'clean',
            description: {
                content: 'to clean the bot messages',
                usage: 'clean [amount]',
                examples: ['clean', 'clean 10']
            },
            voteReq: true,
            category: 'general',
            cooldown: 6,
            permissions: {
                dev: false,
                client: ["SendMessages", "ViewChannel", "EmbedLinks", "ManageMessages"],
                user: ["ManageMessages"],
            },
            options: [
                {
                    name: 'amount',
                    description: 'The amount of messages to delete.',
                    type: 4,
                    required: true,
                    min_value: 1,
                    max_value: 100,
                }
            ]

        });
    }
    async run(client, interaction) {
        const amount = interaction.options.getInteger('amount');
        const data = await db.findOne({ _id: interaction.guild.id });
        if (data) {
            if (data.channel === interaction.channel.id) {
                const embed = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.error} You can\'t clean the bot messages in the setup channel!`)
                return interaction.reply(({ embeds: [embed] }));
            }
        }
        let messagesToDelete = 0;
        if (amount) {
            messagesToDelete = parseInt(amount);
            if (isNaN(messagesToDelete) || messagesToDelete < this.options[0].min_value) {
                const embed1 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.error} Please provide a valid number of messages to delete.`)
                return interaction.reply(({ embeds: [embed1] }));
            }
        }
        let deleteMessages = 0;
        if (interaction.channel.type === 0) {
            await interaction.channel.messages.fetch({ limit: 100 }).then(async messages => {
                let botMessages = messages.filter(msg => msg.author.id === client.user.id);

                if (amount) {
                    botMessages = messages.filter(msg => msg.author.id === client.user.id);
                    botMessages.forEach(msg => {
                        if (messagesToDelete > deleteMessages) {
                            msg.delete();
                            deleteMessages++;
                        }
                    });
                    const embed2 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.success} Sucessfuly deleted \`${deleteMessages}\` messages.`)
                    await interaction.reply(({ embeds: [embed2] }));
                } else {
                    await interaction.channel.bulkDelete(botMessages);
                    const embed3 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.success} Successfully deleted \`${botMessages.size}\` messages.`)
                    return interaction.reply(({ embeds: [embed3] }));

                }
            }).catch(err => {
                const embed4 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.error} An error occured while deleting messages.`)
                return interaction.reply(({ embeds: [embed4] }));
            });
        }
    }
}
