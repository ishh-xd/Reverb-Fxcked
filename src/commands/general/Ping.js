const Command = require('../../structures/Command');
const { ActionRowBuilder } = require('discord.js');

module.exports = class Ping extends Command {
    constructor(client) {
        super(client, {
            name: 'ping',
            description: {
                content: 'To check the bot\'s latency.',
                usage: 'ping',
                examples: ['ping'],
            },
            category: 'general',
            cooldown: 3,
            permissions: {
                dev: false,
                client: ['SendMessages', 'ViewChannel', 'EmbedLinks'],
                user: [],
            },
            player: {
                voice: false,
                dj: false,
                active: false,
                djPerm: null,
            }
        });
    }
    async run(client, interaction) {
        let ping = interaction.createdTimestamp - Date.now();
        let api_ping = client.ws.ping;
        let dbPing = async () => {
            const currentNano = process.hrtime();
            await (require("mongoose")).connection.db.command({ ping: 1 });
            const time = process.hrtime(currentNano);
            return Math.round((time[0] * 1e9 + time[1]) * 1e-6);
        }
        if (ping <= 0) ping = Date.now() - interaction.createdTimestamp;

       const embed1 = client.embed().setColor(client.config.color).setDescription(`\`\`\`nim\nAPI Latency      :: ${Math.round(api_ping)} ms \nBot Latency      :: ${ping} ms \nDatabase Latency :: ${await dbPing()} ms\`\`\``)
        return interaction.reply({ embeds: [embed1] });

    }
};