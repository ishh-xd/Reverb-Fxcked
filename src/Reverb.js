const Bot = require('./structures/Client');
const client = new Bot();
// client creation


// clustering
const { ClusterClient } = require('discord-hybrid-sharding');
client.cluster = new ClusterClient(client);

// stats client
const Stats = require('sharding-stats');
const statsClient = new Stats.Client(client, {
  // this variable is IMPORTANT
  customPoster: true, // use your custom post stats function
  stats_uri: 'https://status.reverbmusic.live/',
  authorizationkey: "12345lmgxenon12345",
})
// define when, and how often to post stats
setInterval(() => postStats(), 2000);
// function to post stats
async function postStats() {
  // all shards of that client-process
  const shards = client.cluster.info.TOTAL_SHARDS;
  // all guilds of that cluster
  const guilds = client.guilds.cache.size;
  for (let i = 0; i < shards.length; i++) {
    // get all guilds in that shard
    const filteredGuilds = guilds ? guilds
      .filter(x => x.shardId === shards[i].id)
      .filter(Boolean)
      : [];
    const body = await client.cluster.broadcastEval(c => ({
      id: c.cluster.id,
      cluster: c.cluster.info.TOTAL_SHARDS,
      status: c.cluster.client.presence.status,
      message: "latest shard debug message",
      ping: c.ws.ping,
      membercount: c.guilds.cache.reduce((prev, guild) => prev + guild.memberCount, 0),
      guildcount: c.guilds.cache.size,
    }));
    await statsClient.sendPostData(body); // it's important to call this "PER SHARD"
  }
}
process.on('uncaughtException', (e) => {
  console.log(e);
});

process.on('unhandledRejection', (e) => {
  console.log(e);
});


client.connect();

module.exports = client;