const Command = require('../../structures/Command');
const { updateQueue, intReply, autoplay } = require("../../handlers/functions");

module.exports = class Autoplay extends Command {
    constructor(client) {
        super(client, {
            name: 'autoplay',
            description: {
                content: "Toggles autoplay.",
                usage: "autoplay",
                examples: []
            },
            voteReq: true,
            category: "music",
            aliases: [],
            cooldown: 6,
            player: {
                voice: true,
                dj: true,
                active: true,
                djPerm: ["DeafenMembers"],
            },
            permissions: {
                dev: false,
                client: ["SendMessages", "ViewChannel", "EmbedLinks", "Connect", "Speak"],
                user: [],
            },
        })
    }
    async run(client, interaction) {
        if(!interaction.replied) await interaction.deferReply().catch(() => { });
        const player = client.player.players.get(interaction.guildId);
        const embed1 = client.embed().setColor(client.config.color).setDescription(`${client.config.emojis.error} There is nothing playing.`);
        if (!player.queue.current) return await intReply(interaction, {embeds: [embed1]}).catch(() => { });

        if (player.autoplay) {
            await player.autoPlay(false);
            player.queue.clear();
            await updateQueue(client, player, interaction.guild);
            const embed2 = client.embed().setColor(client.config.color).setDescription(`${client.config.emojis.success} Autoplay is now **${player.autoplay ? `${this.client.config.emojis.online}` : `${this.client.config.emojis.offline}`}**`);
            return intReply(interaction, {embeds: [embed2]}).catch(() => { });
        } else {
            player.data.set("autoplay", player.queue.current);
            await player.autoPlay(true);
            const au = await autoplay(player, client);
            if (au === "null") return await intReply(interaction,  `${client.config.emojis.error} There were no songs found to play.`);
            await updateQueue(client, player, interaction.guild);
            const embed3 = client.embed().setColor(client.config.color).setDescription(`${client.config.emojis.success} Autoplay is now **${player.autoplay ? `${this.client.config.emojis.online}` : `${this.client.config.emojis.offline}`}**`);
            return await intReply(interaction, {embeds: [embed3]}).catch(() => { });
        }
    }
}