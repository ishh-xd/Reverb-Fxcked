const axios = require('axios');

module.exports = async (client, totalGuilds, totalMem, shardCount) => {
    post();
    setInterval(async function () {
        post();
    }, 1800000);

    async function post() {
        await axios.post(
            'https://discords.com/bots/api/bot/977742811132743762', JSON.stringify({
                'server_count': totalGuilds.toString(),
            }),
            {
                method: 'POST',
                headers: {
                    'Authorization': client.config.botlist.token.discords,
                    'Content-Type': 'application/json',
                },
            },
        ).then(client.logger.info('Posted bot stats to discords.com')).catch(function (error) {
            client.logger.error(error);
        });
    }
};