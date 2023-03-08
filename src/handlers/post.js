const fs = require('fs');

const posts = fs.readdirSync('./src/utils/botlist');
const jsposts = posts.filter(c => c.split('.').pop() === 'js');
if (!posts.length) console.log('No post files found!');

module.exports = (client, totalGuilds, totalMem, shardCount) => {
	for (let i = 0; i < jsposts.length; i++) {
		if (!jsposts.length) client.logger.error('No javascript post files found!');
		require(`../utils/botlist/${jsposts[i]}`)(client, totalGuilds, totalMem, shardCount);
	}
};