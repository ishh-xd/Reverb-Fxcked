const Command = require('../../structures/Command')

module.exports = class Reboot extends Command {
    constructor(client) {
        super(client, {
            name: 'reboot',
            description: {
                content: 'Reboots the bot or a specific shard if given.',
                usage: '<shard or "all">',
                examples: ['1', 'all'],
            },
            aliases: ['restart'],
            permissions: {
                dev: true,
            },
        });
    }
    async run(client, message, args) {
        if (!args[0] || args[0] == 'all') {
            await message.reply('Rebooting all shards...');
            client.cluster.send({ type: 'reboot', cluster: 'all' });
        }
        else if (!isNaN(args[0])) {
            await message.reply(`Rebooting shard ${args[0]}...`);
            client.cluster.send({ type: 'reboot', cluster: Number(args[0]) });
        }
        else {
            await message.reply('Invalid argument. Please specify a shard or "all".');
        }
    }
};