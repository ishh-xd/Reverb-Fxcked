const { ClusterManager } = require('discord-hybrid-sharding');
const { token } = require('./config');
const Logger = require('./structures/Logger');


const logger = new Logger({
  displayTimestamp: true,
  displayDate: true
});
const manager = new ClusterManager('./src/Reverb.js', {
  token,
  shardsPerClusters: 5,
  totalShards: 'auto',
  totalClusters: 'auto',
  mode: 'process',
});


const ShardCreate = require('./events/shard/clusterCreate');

manager.on("clusterCreate", async (cluster) => (new ShardCreate(null, ShardCreate)).run(cluster, manager, logger));

manager.spawn({ timeout: -1 });
