const Event = require("../../structures/Event");
const { Message, PermissionFlagsBits, ActionRowBuilder, EmbedBuilder, ChannelType } = require("discord.js");
const db = require("../../schemas/setup");
const textchannel = require("../../schemas/guilds")

module.exports = class MessageCreate extends Event {
    constructor(...args) {
        super(...args)
    }
    /**
     * 
     * @param {Message} message 
     * @returns 
     */
    async run(message) {
        if (message.author.bot || message.channel.type === ChannelType.DM) return;
        let guildData = await textchannel.findOne({ _id: message.guildId });
        if(!guildData) guildData = new textchannel({
            _id: message.guildId,

        })
        let data = await db.findOne({ _id: message.guildId });
        if (data && data.channel && message.channelId === data.channel) {
            return this.client.emit("setupSystem", message);
        }
        if (message.channel.type === ChannelType.GuildText) {
            const prefix = this.client.config.prefix;
            const color = this.client.config.color ? this.client.config.color : "#ff0080"
            const mention = new RegExp(`^<@!?${this.client.user.id}>( |)$`);
            if (message.content.match(mention)) {
                if (message.channel.permissionsFor(this.client.user).has([PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.ViewChannel])) {
                    const embed = new EmbedBuilder()
                        .setColor(color)
                        .setDescription(`Hey <@${message.author.id}>, [Reverb](http://reverbmusic.live) is a Discord music bot with lots of features and high-quality music! use ${this.client.config.cmdId.help} to get started.`)
                    await message.reply({ embeds: [embed], components: [new ActionRowBuilder().addComponents(this.client.button().setLabel("Support Server").setStyle(5).setURL(this.client.config.links.server))] }).catch(() => { });
                };
            };
            const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const prefixRegex = new RegExp(`^(<@!?${this.client.user.id}>|${escapeRegex(prefix)})\\s*`);
            if (!prefixRegex.test(message.content)) return;
            const [matchedPrefix] = message.content.match(prefixRegex);

            const args = message.content.slice(matchedPrefix.length).trim().split(/ +/g);
            const commandName = args.shift().toLowerCase();

            const devcmd = this.client.devscmds.get(commandName)
            if (!devcmd) return;
            if (devcmd.permissions.dev) {
                if (this.client.config.devs) {
                    const findDev = this.client.config.devs.find((x) => x === message.author.id);
                    if (!findDev) return;
                };
            }
            if (guildData &&
                guildData.botChannel &&
                message.guild.channels.cache.has(guildData.botChannel) &&
                message.channelId !== guildData.botChannel &&
                !message.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return message.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(color)
                            .setDescription(
                                `You are allowed to use my commands in <#${guildData.botChannel}>${message.guild.channels.cache.has(guildData.reqSystem.channelId)} only.`
                            ),
                    ],
                });
            }
            try {

                return await devcmd.run(this.client, message, args);

            } catch (error) {
                await message.channel.send({ content: "An unexpected error occured, the developers have been notified!" }).catch(() => { });
                console.error(error);
            };
        }

    };

}


