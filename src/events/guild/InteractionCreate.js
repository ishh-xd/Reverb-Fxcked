const { CommandInteraction, WebhookClient, InteractionType, Collection, PermissionFlagsBits, PermissionsBitField, ActionRowBuilder, EmbedBuilder, ChannelType } = require("discord.js");
const db = require("../../schemas/setup");
const djSetup = require("../../schemas/dj");
const Topgg = require("@top-gg/sdk");
const Event = require("../../structures/Event");
const Playlist = require("../../schemas/playlists");
const missingPermissions = require('../../utils/missingPermissions');
const { intCheck } = require("../../handlers/functions");
const textchannel = require("../../schemas/guilds")
const pdata = require("../../schemas/premium")

module.exports = class InteractionCreate extends Event {
  constructor(...args) {
    super(...args);
  }
  /**
   * 
   * @param {CommandInteraction} interaction 
   */
  async run(interaction, client) {
    let color = this.client.config.color ? this.client.config.color : "#ff0080"

    const PUser = await pdata.findOne({ _id: interaction.user.id });

    let data = await db.findOne({ _id: interaction.guildId });
    if (interaction.isButton()) {
      if (data && interaction.channelId === data.channel && interaction.message.id === data.message) {
        const setup = this.client.setup.get(interaction.customId);
        if (!setup) return;
        if (interaction.guild.members.me.voice.channel && !interaction.guild.members.me.voice.channel.equals(interaction.member.voice.channel)) return interaction.reply({ embeds: [new EmbedBuilder().setColor(color).setDescription(`${this.client.config.emojis.error} You must be in the same voice channel as the bot to use this button.`)], ephemeral: true }).catch(() => { });
        if (!interaction.member.voice.channel) return interaction.reply({ embeds: [new EmbedBuilder().setColor(color).setDescription(`${this.client.config.emojis.error} You are not connected to a voice channel to use this button.`)], ephemeral: true }).catch(() => { });
        if (interaction.guild.members.me.voice.channel && interaction.guild.members.me.voice.channelId !== interaction.member.voice.channelId) return interaction.reply({ embeds: [new EmbedBuilder().setColor(color).setDescription(`${this.client.config.emojis.error} You are not connected to ${interaction.guild.members.me.voice.channel} to use this button.`)], ephemeral: true }).catch(() => { });


        let check = await intCheck(interaction, PermissionFlagsBits.DeafenMembers);
        if (!check) return interaction.reply({ embeds: [new EmbedBuilder().setColor(color).setDescription(`${this.client.config.emojis.error} You don't have a dj role or permission to use this button.`)], ephemeral: true }).catch(() => { });
        const player = this.client.player.players.get(interaction.guildId);
        if (!player) return interaction.reply({ embeds: [new EmbedBuilder().setColor(color).setDescription(`${this.client.config.emojis.error} There is nothing playing in this server.`)] }).catch(() => { });
        if (!player.queue) return interaction.reply({ embeds: [new EmbedBuilder().setColor(color).setDescription(`${this.client.config.emojis.error} There is nothing playing in this server.`)] }).catch(() => { });
        if (!player.queue.current) return interaction.reply({ embeds: [new EmbedBuilder().setColor(color).setDescription(`${this.client.config.emojis.error} There is nothing playing in this server.`)] }).catch(() => { });

        try {
          await setup.run(this.client, interaction, player, data, color);
        } catch (error) {
          this.client.logger.error(error);
        }
      }
      const button = this.client.buttons.get(interaction.customId);
      if (!button) return;
      if (interaction.guild.members.me.voice.channel && !interaction.guild.members.me.voice.channel.equals(interaction.member.voice.channel)) return interaction.reply({ embeds: [new EmbedBuilder().setColor(color).setDescription(`${this.client.config.emojis.error} You must be in the same voice channel as the bot to use this button.`)], ephemeral: true }).catch(() => { });


      try {
        await button.run(this.client, interaction, color);
      } catch (error) {
        this.client.logger.error(error);
      }
    } else if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
      const playlistCommandsWithAutocomplete = ['playlist-addnowplaying', 'playlist-addqueue', 'playlist-add', 'pl-delete', 'playlist-remove', 'playlist-view', 'playlist-load', 'playlist-dupes', 'playlist-rename']
      if (playlistCommandsWithAutocomplete.includes(interaction.commandName)) {
        Playlist.find({
          _id: interaction.user.id,
        }).sort({ createdTimestamp: 1 }).then(async (p) => {
          const focusedValue = interaction.options.getFocused();
          const playlists = [];
          for (let i = 0; i < p.length; i++) {
            playlists.push(p[i].playlistName);
          }
          const filtered = playlists.filter(choice => choice.startsWith(focusedValue));
          if (filtered.length > 25) filtered.length = 25;
          await interaction.respond(filtered.map(choice => ({ name: choice, value: choice })));
        }).catch(() => {
          return;
        });
      }

    } else if (interaction.type === InteractionType.ApplicationCommand) {
      let guildData = await textchannel.findOne({ _id: interaction.guildId });
      if (!guildData) guildData = new textchannel({
        _id: interaction.guildId,
        botChannel: null,
        guildName: interaction.guild.name
      }).save();
      const { commandName } = interaction;
      if (!commandName) return await interaction.reply({ content: "Unknown interaction!" }).catch(() => { });

      let cmd = this.client.commands.get(commandName);
      if (!cmd) return;
      const command = cmd.name.toLowerCase();
      this.client.logger.cmd('%s used by %s from %s', command, interaction.user.id, interaction.guildId);
      if (!interaction.inGuild() || !interaction.channel.permissionsFor(interaction.guild.members.me).has(PermissionFlagsBits.ViewChannel)) return;
      if (data) {
        if (data.channel === interaction.channelId) {
          return interaction.reply({ embeds: [new EmbedBuilder().setColor(color).setDescription(`${this.client.config.emojis.error} You cannot use commands in the setup channel.`)], ephemeral: true }).catch(() => { });

        }
      }
      if ( guildData.botChannel &&    interaction.guild.channels.cache.has(guildData.botChannel) &&  interaction.channelId !== guildData.botChannel &&
        !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(color)
              .setDescription(
                `You are allowed to use my commands in <#${guildData.botChannel}> only.`
              ),
          ],
        });
      }
      const permissionHelpMessage = `If you need help configuring the correct permissions for the bot join the support server: ${this.client.config.links.server}`;
      cmd.permissions.client = cmd.permissions.client.concat([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks]);
      if (cmd.permissions.client.length > 0) {
        const missingPerms = missingPermissions(cmd.permissions.client, interaction.channel, interaction.guild.members.me);
        if (missingPerms.length > 0) {
          if (missingPerms.includes(PermissionsBitField.Flags.SendMessages)) {
            const user = this.client.users.cache.get('id');
            if (!user) return;
            else if (!user.dmChannel) await user.createDM();
            await user.dmChannel.send({ embeds: [new EmbedBuilder().setColor(color).setDescription(`${this.client.config.emojis.error} I don't have the required permissions to execute this command. Missing permission(s): **${missingPerms.join(', ')}**\n${permissionHelpMessage}`)] }).catch(() => { });
          }
          return interaction.reply({ embeds: [new EmbedBuilder().setColor(color).setDescription(`${this.client.config.emojis.error} I don't have the required permissions to execute this command. Missing permission(s): **${missingPerms.join(', ')}**\n${permissionHelpMessage}`)] }).catch(() => { });

        }
      }

      /* Premium Only
      if (cmd.PremiumOnly) {
        if (!PUser) {
    
            if (interaction.replied) {
            return await interaction.editReply({ embeds: [new EmbedBuilder().setColor(color).setDescription(`You must vote me on [Top.gg](${this.client.config.botlist.topgg}) to use this command, or you can purchase premium to override all command restrictions`)], components: [new ActionRowBuilder().addComponents(this.client.button().setLabel("Vote").setStyle(5).setURL(this.client.config.botlist.topgg))] }).catch(() => { });
            } else {
              return await interaction.reply({ embeds: [new EmbedBuilder().setColor(color).setDescription(`You must vote me on [Top.gg](${this.client.config.botlist.topgg}) to use this command, or you can purchase premium to override all command restrictions`)], components: [new ActionRowBuilder().addComponents(this.client.button().setLabel("Vote").setStyle(5).setURL(this.client.config.botlist.topgg))] }).catch(() => { });
            }
          }
        }
      }
      */

      if (cmd.voteReq) {
        if (!PUser) {
          const topgg = new Topgg.Api(this.client.config.botlist.token.topgg);
          let voted = await topgg.hasVoted(interaction.user.id);
          if (!voted && !this.client.config.devs.includes(interaction.user.id)) {
            if (interaction.replied) {
              return await interaction.editReply({ embeds: [new EmbedBuilder().setColor(color).setDescription(`You must vote me on [Top.gg](${this.client.config.botlist.topgg}) to use this command, or you can purchase premium to override all command restrictions`)], components: [new ActionRowBuilder().addComponents(this.client.button().setLabel("Vote").setStyle(5).setURL(this.client.config.botlist.topgg))] }).catch(() => { });
            } else {
              return await interaction.reply({ embeds: [new EmbedBuilder().setColor(color).setDescription(`You must vote me on [Top.gg](${this.client.config.botlist.topgg}) to use this command, or you can purchase premium to override all command restrictions`)], components: [new ActionRowBuilder().addComponents(this.client.button().setLabel("Vote").setStyle(5).setURL(this.client.config.botlist.topgg))] }).catch(() => { });
            }
          }
        }
      };


      if (cmd.permissions.user.length > 0) {
        const missingPerms = missingPermissions(cmd.permissions.user, interaction.channel, interaction.member);
        if (missingPerms.length > 0) {
          return interaction.reply({ embeds: [new EmbedBuilder().setColor(color).setDescription(`${this.client.config.emojis.error} You don't have the required permissions to execute this command. Missing permission(s): **${missingPerms.join(', ')}**`)], ephemeral: true }).catch(() => { });

        }
      }

      if (cmd.permissions.dev) {
        if (this.client.config.devs) {
          const findDev = this.client.config.devs.find((x) => x === interaction.user.id);
          if (!findDev) return;
        };

      }
      if (cmd.player) {
        if (cmd.player.voice) {
          if (!interaction.member.voice.channel) return await interaction.reply({ embeds: [new EmbedBuilder().setColor(color).setDescription(`${this.client.config.emojis.error} You must be connected to a voice channel to use the **${cmd.name}** command.`)] }).catch(() => { });
          if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.Speak)) return await interaction.reply({ embeds: [new EmbedBuilder().setColor(color).setDescription(`${this.client.config.emojis.error} I don't have **Connect** permissions to execute this **${cmd.name}** cmd.`)] }).catch(() => { });

          if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.Speak)) return await interaction.reply({ embeds: [new EmbedBuilder().setColor(color).setDescription(`${this.client.config.emojis.error} I don't have **Speak** permissions to execute this **${cmd.name}** cmd.`)] }).catch(() => { });


          if (interaction.member.voice.channel.type === ChannelType.GuildStageVoice && !interaction.guild.members.me.permissions.has(PermissionFlagsBits.RequestToSpeak)) return await interaction.reply({ embeds: [new EmbedBuilder().setColor(color).setDescription(`${this.client.config.emojis.error} I don't have **RequestToSpeak** permission to execute the **${cmd.name}** cmd.`)] }).catch(() => { });


          if (interaction.guild.members.me.voice.channel) {
            if (interaction.guild.members.me.voice.channelId !== interaction.member.voice.channelId) {
              if (cmd.name === "join") return await interaction.reply({ embeds: [new EmbedBuilder().setColor(color).setDescription(`${this.client.config.emojis.error} I am already connected to ${interaction.guild.members.me.voice.channel}`)] }).catch(() => { });
              return await interaction.reply({ embeds: [new EmbedBuilder().setColor(color).setDescription(`${this.client.config.emojis.error} You are not connected to ${interaction.guild.members.me.voice.channel} to use the **${cmd.name}** command.`)] }).catch(() => { });
            };
          };
        };

        if (cmd.player.active) {
          if (!this.client.player.players.get(interaction.guildId)) return await interaction.reply({ embeds: [new EmbedBuilder().setColor(color).setDescription(`${this.client.config.emojis.error} There is nothing playing right now.`)] }).catch(() => { });
          if (!this.client.player.players.get(interaction.guildId).queue) return await interaction.reply({ embeds: [new EmbedBuilder().setColor(color).setDescription(`${this.client.config.emojis.error} There is nothing playing right now.`)] }).catch(() => { });
          if (!this.client.player.players.get(interaction.guildId).queue.current) return await interaction.reply({ embeds: [new EmbedBuilder().setColor(color).setDescription(`${this.client.config.emojis.error} There is nothing playing right now.`)] }).catch(() => { });
        };

        if (cmd.player.dj) {
          let data = await djSetup.findOne({ _id: interaction.guildId });
          let perm = PermissionFlagsBits.DeafenMembers;

          if (cmd.djPerm) perm = cmd.djPerm;

          if (data) {
            if (data.mode === true) {
              let pass = false;
              const missingPerms = missingPermissions(cmd.player.djPerm ? cmd.player.djPerm : perm, interaction.channel, interaction.member);
              if (data.roles.length > 0) {
                interaction.member.roles.cache.forEach((x) => {
                  let role = data.roles.find((r) => r === x.id);
                  if (role) pass = true;
                });
              };

              if (!pass && !interaction.member.permissions.has(perm)) return await interaction.reply({ embeds: [new EmbedBuilder().setColor(client.concolor).setDescription(`${this.client.config.emojis.error} You don't have enough permission(s): **${missingPerms.join(', ')}** or a dj role to use this cmd.`)] }).catch(() => { });

            };
          };
        };
      };


      if (!this.client.config.devs.includes(interaction.user.id)) {
        if (!this.client.cooldowns.has(commandName)) {
          this.client.cooldowns.set(commandName, new Collection());
        }
        const now = Date.now();
        const timestamps = this.client.cooldowns.get(commandName);
        const cooldownAmount = Math.floor(cmd.cooldown || 5) * 1000;
        if (!timestamps.has(interaction.user.id)) {
          timestamps.set(interaction.user.id, now);
          setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
        }
        else {
          const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
          const timeLeft = (expirationTime - now) / 1000;
          if (now < expirationTime && timeLeft > 0.9) {
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(color).setDescription(`${this.client.config.emojis.error} Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the **${commandName}** command.`)] }).catch(() => { });

          }
          timestamps.set(interaction.user.id, now);
          setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
        }
      }

      try {

        return await cmd.run(this.client, interaction, color);

      } catch (error) {
        console.error(error);
        await interaction.reply({ embeds: [new EmbedBuilder().setColor(color).setDescription(`An unexpected error occured, the developers have been notified.`)] }).catch(() => { });

      };
    };

  }

}
