const Event = require("../../structures/Event");
const { WebhookClient, EmbedBuilder } = require("discord.js");
const db = require("../../schemas/247");

module.exports = class Ready extends Event {
    constructor(...args) {
        super(...args)
    }
    /**
     * 
     * @param {import('shoukaku').NodeOption} name 
     */
    async run(name) {
        this.client.logger.ready(`${name} Lavalink node is ready!`);
        this.client.logger.info("Auto Reconnect Collecting player 24/7 data");
        const maindata = await db.find()
        this.client.logger.info(`Auto Reconnect found ${maindata.length ? `${maindata.length} queue${maindata.length > 1 ? 's' : ''}. Resuming all auto reconnect queue` : '0 queue'}`);
        for (let data of maindata) {
            const index = maindata.indexOf(data);
            setTimeout(async () => {
                let text = this.client.channels.cache.get(data.textChannel)
                let guild = this.client.guilds.cache.get(data._id);
                let voice = this.client.channels.cache.get(data.voiceChannel)
                if (voice) {
                    if (data.mode === true) {
                        let player = this.client.player.createPlayer({
                            guildId: guild.id,
                            textId: text.id,
                            voiceId: voice.id,
                            deaf: true,
                            shardId: guild.shardId,
                        });
                        
                    }
                } else {
                  const embed12 = new EmbedBuilder()
                .setColor("#ff0080")
                .setDescription(`I cannot find the 24/7 voice channel <#${voice}> to join again.`)
                    if(text) return await text.send({ embeds: [embed12] });
                }
            }), index * 5000

        }
        let channel = new WebhookClient({ url: this.client.config.hooks.lavalink.url });
      const embed11 = new EmbedBuilder()
                .setColor("#ff0080")
                .setDescription(`Node **${name}** has been connected!`)
        if (channel) return await channel.send({ embeds: [embed11] }).catch(() => { });

    }
}
