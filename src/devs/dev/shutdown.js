const Command = require('../../structures/Command')

module.exports = class Shutdown extends Command {
    constructor(client) {
        super(client, {
            name: 'shutdown',
            description: {
                content: 'Shuts down the bot or a specific shard if given.',
                usage: '<shard or "all">',
                examples: ['1', 'all'],
            },
            aliases: ['die', 'kill'],
            permissions: {
                dev: true,
            },
        });
    }
    async run(client, message, args) {
        if (!args[0] || args[0] == 'all') {
            await message.reply('Shutting down all shards...');
            client.cluster.send({ type: 'shutdown', cluster: 'all' });
        }
        else if (!isNaN(args[0])) {
            await message.reply(`Shutting down shard ${args[0]}...`);
            client.cluster.send({ type: 'shutdown', cluster: Number(args[0]) });
        }
        else {
            await message.reply('Invalid argument. Please specify a shard or "all".');
        }
    }
};