const Event = require("../../structures/Event");

module.exports = class Ready extends Event {
    constructor(...args) {
        super(...args);
    }
    async run() {

        const postHandler = require('../../handlers/post');

        this.client.logger.ready(`Logged in as `, this.client.user.tag);

        this.client.cluster.triggerReady();
        this.client.user.setPresence({
            activities: [
                {
                    name: "/play",
                    type: 2,
                }
            ],
            status: "online"
        });
        
         if (this.client.cluster.id == this.client.cluster.count - 1) {
  
              const guildNum = await this.client.cluster.fetchClientValues('guilds.cache.size');
              const memberNum = await this.client.cluster.broadcastEval(c => c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0))
              const totalMem = memberNum.reduce((prev, memberCount) => prev + memberCount, 0);
              const totalGuilds = guildNum.reduce((total, cluster) => total + cluster, 0);
              this.client.logger.ready(`${this.client.user.tag} is online in ${this.client.cluster.info.TOTAL_SHARDS} shards with ${totalGuilds} guilds and ${totalMem} members.`);
              postHandler(this.client, totalGuilds, totalMem, this.client.cluster.info.TOTAL_SHARDS);
              // await require('../utils/Votes/dbl').startUp(client);
              //await require('../utils/').startUp(client);
          }

        if (this.client.config.Dashboard) {
          try {
            require("../../dashboard/dashboard.js")(this.client);
          } catch (e) {
            console.log(e)
          }
        }
    }
}
