const { spotify, nodes } = require("../config");
const { Kazagumo, Plugins } = require("kazagumo");
const Spotify = require('kazagumo-spotify');
const { readdirSync } = require("fs");
const { Connectors } = require("shoukaku");
const PlayerExtends = require("./ExtentsPlayer");

class PlayerManager extends Kazagumo {
    constructor(client) {
        super({
            nodes: nodes,
            defaultSearchEngine: "youtube_music",
            plugins: [
                new Spotify({
                    clientId: spotify.client_id,
                    clientSecret: spotify.client_secret,
                    playlistPageLimit: 1,
                    albumPageLimit: 1,
                    searchLimit: 10
                }),
                new Plugins.PlayerMoved(client)
            ],
            extends: {
                player: PlayerExtends
            },
           
            send: (id, payload) => this._sendPayload(id, payload),

        }, new Connectors.DiscordJS(client), nodes)
        this.client = client;
        this._loadEvents();
        this._loadShouhakaEvents()
    }  

    _sendPayload(id, payload) {
        const guild = this.client.guilds.cache.get(id);
        if (guild) return guild.shard.send(payload);
    };

    /**
     * @private
     */

    _loadEvents() {
        let count = 0;
        const events = readdirSync(`./src/events/player`).filter(c => c.split('.').pop() === 'js');
        if (!events.length) throw new Error(`[ Event Loader Error ]: No events found.`);
        events.forEach(async (eventStr) => {
            const files = require(`../events/player/${eventStr}`);
            const event = new files(this.client, files);
            const eventName = eventStr.split('.')[0].charAt(0).toLowerCase() + eventStr.split('.')[0].slice(1);
            this.on(eventName, (...args) => event.run(...args));
            count++;
        })

        this.client.logger.event(`Player Manager ${count} events loaded.`);
    }
    _loadShouhakaEvents() {
        let count = 0;
        const events = readdirSync(`./src/events/node`).filter(c => c.split('.').pop() === 'js');
        if (!events.length) throw new Error(`[ Event Loader Error ]: No events found.`);
        events.forEach(async (eventStr) => {
            const files = require(`../events/node/${eventStr}`);
            const event = new files(this.client, files);
            const eventName = eventStr.split('.')[0].charAt(0).toLowerCase() + eventStr.split('.')[0].slice(1);
            this.shoukaku.on(eventName, (...args) => event.run(...args));
            count++;
        })

        this.client.logger.event(`Shoukaku Manager ${count} events loaded.`);
    }
};

module.exports = PlayerManager;