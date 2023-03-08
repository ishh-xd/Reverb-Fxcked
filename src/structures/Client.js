const { Client, Routes, REST, ActionRowBuilder, PermissionsBitField, ApplicationCommandType, GatewayIntentBits, Partials, Collection, EmbedBuilder, ButtonBuilder, SelectMenuBuilder } = require("discord.js");
const PlayerManager = require("./Player");
const { connect } = require("mongoose");
const { readdirSync } = require('node:fs');
const config = require('../config');
const Logger = require("./Logger");
const { ClusterClient, getInfo } = require('discord-hybrid-sharding');
const Spotify = require('./Spotify');

/**
 * The bot's client ;0
 * @extends {Client}
 * discord.js Client
 */
module.exports = class botClient extends Client {
    constructor() {
        super({
            allowedMentions: {
                parse: ["users", "roles", "everyone"],
                repliedUser: false,
            },
            shards: getInfo().SHARD_LIST,
            shardCount: getInfo().TOTAL_SHARDS,
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.GuildMessageTyping,
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildIntegrations,
                GatewayIntentBits.GuildWebhooks,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildInvites,
            ],
            partials: [Partials.Channel, Partials.GuildMember, Partials.Message, Partials.User, Partials.Reaction],
            restTimeOffset: 0,
        });

        this.config = require("../config");
        if (!this.token) this.token = this.config.token;
        this.buttons = new Collection();
        this.modals = new Collection();
        this.setup = new Collection();
        this.commands = new Collection();
        this.cooldowns = new Collection();
        this.devscmds = new Collection();
        this.aliases = new Collection();
        this.guildSettings = new Collection();
        this.cluster = new ClusterClient(this)
        this.logger = new Logger({
            displayTimestamp: true,
            displayDate: true
        });
        this.spotify = new Spotify(this);
        this.player;
        this._connectMongodb();

        this.on("guildCreate", async (guild) => {
            const guild1 = await this.guilds.fetch('919820769243062302');
            const channel = await guild1.channels.fetch('936524382501765140');
            const embed = new EmbedBuilder()
            .setThumbnail(guild?.iconURL({}))
            .setTitle(`Joined a guild`)
            .setColor("#ff0080")
            .addFields([
              {
                name: "Created on",
                value: `<t:${Math.round(guild?.createdTimestamp / 1000)}>`,
                inline: false
              },
              {
                name: "Added on",
                value: `<t:${Math.round(Date.now() / 1000)}>`,
                inline: false
              },
              {
                name: "Guild ID",
                value: `\`${guild?.id}\``,
                inline: false
              },
              {
                name: "Owner",
                value: `<@${guild?.ownerId}> (\`ID: ${guild?.ownerId}\`)`,
                inline: false
              },
              {
                name: "Total member count",
                value: `${guild?.memberCount}`,
                inline: false
              },
              {
                name: "Total server count",
                value: `NaN`,
                inline: false
              }
            ]);
      
            await channel.send({embeds: [embed]})
        })
    }

    /**
     * 
     * @returns {EmbedBuilder}
     */

    embed() {
        return new EmbedBuilder();
    };

    /**
     * 
     * @returns {ButtonBuilder}
     */

    button() {
        return new ButtonBuilder();
    };
    /**
      * 
      * @returns {ActionRowBuilder}
      */

    raw() {
        return new ActionRowBuilder();
    }
    /**
     * 
     * @returns {SelectMenuBuilder}
     */

    menu() {
        return new SelectMenuBuilder();
    };

    _loadPlayer() {
        this.player = new PlayerManager(this);
        return this.player;
    };
    /**
     * @private
     */

    _loadDevcmds() {
        const commandsFolder = readdirSync('./src/devs/');
        commandsFolder.forEach(category => {
            const categories = readdirSync(`./src/devs/${category}/`).filter(file => file.endsWith('.js'));
            categories.forEach(command => {
                const f = require(`../devs/${category}/${command}`);
                const cmd = new f(this, f);
                cmd.category = category;
                cmd.file = f;
                cmd.fileName = f.name;
                this.devscmds.set(cmd.name, cmd);
            });
        });
    }
    _loadCommands() {
        const data = [];
        let i = 0;
        const commandsFolder = readdirSync('./src/commands/');
        commandsFolder.forEach(category => {
            const categories = readdirSync(`./src/commands/${category}/`).filter(file => file.endsWith('.js'));
            categories.forEach(command => {
                const f = require(`../commands/${category}/${command}`);
                const cmd = new f(this, f);
                cmd.category = category;
                cmd.file = f;
                cmd.fileName = f.name;
                this.commands.set(cmd.name, cmd);

                if (cmd) {
                    data.push({
                        name: cmd.name,
                        description: cmd.description.content,
                        type: ApplicationCommandType.ChatInput,
                        options: cmd.options ? cmd.options : null,
                    });
                    if (cmd.permissions.user.length > 0) data.default_member_permissions = cmd.permissions.user ? PermissionsBitField.resolve(cmd.permissions.user).toString() : 0;
                    ++i
                }
            });
        });
        this.logger.event(`Successfully loaded [/] command ${i}.`)

        const rest = new REST({ version: '9' }).setToken(this ? this.config.token : config.token);

        rest.put(Routes.applicationCommands(this ? this.config.clientId : config.clientId), { body: data }).then(() => this.logger.info('Successfully reloaded application (/) commands.')).catch((e) => console.error(e));

    }

    _loadEvents() {
        const EventsFolder = readdirSync('./src/events')
        let i = 0;
        EventsFolder.forEach(async (eventFolder) => {
            const events = readdirSync(`./src/events/${eventFolder}`).filter(c => c.split('.').pop() === 'js');
            if (eventFolder != 'player' && eventFolder != 'node') {
                events.forEach(async (eventStr) => {
                    if (!events.length) throw Error('No event files found!');
                    const file = require(`../events/${eventFolder}/${eventStr}`);
                    const event = new file(this, file);
                    const eventName = eventStr.split('.')[0].charAt(0).toLowerCase() + eventStr.split('.')[0].slice(1);
                    this.on(eventName, (...args) => event.run(...args));
                    ++i;
                });

            }

        });
        this.logger.event(`Successfully loaded event ${i}.`)
    }
    _loadComponents() {
        const componentFolders = readdirSync('./src/components/');
        for (const component of componentFolders) {
            const componentFiles = readdirSync(`./src/components/${component}`);
            switch (component) {
                case 'buttons':
                    this.loadButtons(componentFiles);
                    break;
                case 'setup':
                    this.loadSetup(componentFiles);
                    break;
                case 'modals':
                    this.loadModals(componentFiles);
                    break;
                default:
                    break;
            }
        }
    }

    loadSetup(setupFiles) {
        for (const file of setupFiles) {
            const f = require(`../components/setup/${file}`);
            const setup = new f(this, f);
            this.setup.set(setup.id, setup);
        }
    }
    loadButtons(buttonFolder) {
        for (const buttonFile of buttonFolder) {
            const f = require(`../components/buttons/${buttonFile}`);
            const button = new f(this, f);
            this.buttons.set(button.id, button);
        }
    }

    loadModals(modalFolder) {
        for (const modalFile of modalFolder) {
            const f = require(`../components/modals/${modalFile}`);
            const modal = new f(this, f);
            this.modals.set(modal.id, modal);
        }

    }
    reloadFile(fileToReload) {
        delete require.cache[require.resolve(fileToReload)];
        return require(fileToReload);
    }
    reloadCommands(commandsToReload) {
        if (commandsToReload.length > 0) {
            commandsToReload.forEach(c => {
                if (c) {
                    this.reloadFile(`${process.cwd()}/src/commands/${c.category}/${c.fileName}`);
                    this._loadCommands(c.fileName, c.category);
                    this.logger.info('Reloaded %s command', c.fileName);
                }
            });
        } else {
            this.commands.forEach(command => {
                this.reloadFile(`${process.cwd()}/src/commands/${command.category}/${command.fileName}`);
                this.logger.info('Reloaded %s command', command.fileName);
            });
            this._loadCommands();
        }
    }
    async _connectMongodb() {
        await connect(this.config.mongodb);
        this.logger.ready('Successfully connected to MongoDB.');
    };
    async connect() {
        super.login(this.token);
        this._loadEvents();
        this._loadCommands();
        this._loadDevcmds();
        this._loadComponents();
        this._loadPlayer();

    };
};

