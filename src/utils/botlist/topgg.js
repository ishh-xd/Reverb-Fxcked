const axios = require('axios');

module.exports = async (client, totalGuilds, totalMem, shardCount) => {
    post();
    setInterval(async function () {
        post();
    }, 1800000);
    
    async function post() {
        await axios.post(
            'https://top.gg/api/bots/910042269657231432/stats',
            JSON.stringify({
                'server_count': '972534',
                'shard_count': '742',
            }),
            {
                method: 'POST',
                headers: {
                    'Authorization': client.config.botlist.token.topgg,
                    'Content-Type': 'application/json',
                },
            },
        ).then(client.logger.info('Posted bot stats to top.gg')).catch(function (error) {
            client.logger.error(error);
        });
    }
};