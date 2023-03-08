const axios = require('axios');

module.exports = async (client, totalGuilds, totalMem, shardCount) => {
    post();
    setInterval(async function () {
        post();
    }, 1800000);

    async function post() {
        await axios.post(
            'https://discordbotlist.com/api/v1/bots/910042269657231432/stats',
            JSON.stringify({
                'guilds': totalGuilds,
                'users': totalMem,
            }),
            {
                method: 'POST',
                headers: {
                    'Authorization': client.config.botlist.token.dbl,
                    'Content-Type': 'application/json',
                },
            },
        ).then(client.logger.info('Posted bot stats to discordbotlist.com')).catch(function (error) {
            client.logger.error(error);
        });
    }
};