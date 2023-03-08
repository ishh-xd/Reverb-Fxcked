const Command = require("../../structures/Command");
const { ActionRowBuilder } = require('discord.js');

module.exports = class Vote extends Command {
    constructor(client) {
        super(client, {
            name: "vote",
            description: {
                content: "Gives you a link to vote for the bot.",
                usage: "vote",
                examples: ["vote"]
            },
            category: "Info",
            cooldown: 3,
            permissions: {
                dev: false,
                client: ["SendMessages", "ViewChannel", "EmbedLinks"],
                user: [],
            },
            player: {
                voice: false,
                dj: false,
                active: false,
                djPerm: null,
            },
        })
    }
    async run(client, interaction) {
        const embed1 = client.embed().setColor(client.config.color).setDescription(`Vote for Reverb by clicking [here](${client.config.botlist.topgg}) or on the button below.`);

        const vote = client.button().setLabel("Vote").setURL(client.config.botlist.topgg).setStyle(5);

        await interaction.reply({ embeds: [embed1], components: [new ActionRowBuilder().addComponents(vote)] }).catch(() => { });
    }
}