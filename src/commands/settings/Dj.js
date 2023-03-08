const Command = require('../../structures/Command');
const db = require('../../schemas/dj');
const { paginate } = require('../../handlers/functions');
const { EmbedBuilder } = require("discord.js")

module.exports = class Dj extends Command {
  constructor(client) {
    super(client, {
      name: 'dj',
      description: {
        content: 'Set the DJ role for the server.',
        usage: 'dj [role]',
        examples: ['dj @DJ'],
      },
      voteReq: true,
      category: 'settings',
      cooldown: 3,
      permissions: {
        dev: false,
        client: ['SendMessages', 'ViewChannel', 'EmbedLinks'],
        user: ['ManageGuild'],
      },
      player: {
        voice: false,
        dj: false,
        active: false,
        djPerm: null,
      },
      options: [
        {
          name: "add",
          description: "To add a role to dj role(s).",
          type: 1,
          options: [
            {
              name: "role",
              description: "The role to add.",
              type: 8,
              required: true
            }
          ]
        },

        {
          name: "clear",
          description: "To clear all dj role data.",
          type: 1
        },

        {
          name: "toggle",
          description: "To enable/disable dj mode.",
          type: 1
        },

        {
          name: "remove",
          description: "To remove a added role from dj role(s).",
          type: 1,
          options: [
            {
              name: "roles",
              description: "The role from dj role list.",
              type: 8,
              required: true
            }
          ]
        },

        {
          name: "list",
          description: "Shows the dj role(s) list.",
          type: 1
        },

        {
          name: "info",
          description: "Gets info about the dj setup.",
          type: 1
        },

        {
          name: "members",
          description: "Shows the dj members (One's who has the dj role).",
          type: 1
        }
      ],
    });
  }
  async run(client, interaction) {
    let data = await db.findOne({ _id: interaction.guildId });

    const subCommand = interaction.options.data[0].name;
    switch (subCommand) {
      case "add":
        const role = interaction.guild.roles.cache.get(interaction.options.getRole("role").id);
        const embed = new EmbedBuilder()
          .setColor(client.config.color)
          .setDescription(`Please provide a valid role.`)
        if (!role) return interaction.reply(({ embeds: [embed] }));

        if (!data) {
          data = new db({
            _id: interaction.guildId,
            mode: true,
            roles: [role.id],
            moderator: interaction.user.id,
            lastUpdated: Math.round(Date.now() / 1000)
          });
          await data.save();
          const embed1 = new EmbedBuilder()
            .setColor(client.config.color)
            .setDescription(`${client.config.emojis.success} Successfully added the role ${role} to dj role(s).`)
          return await interaction.reply(({ embeds: [embed1] }));
        } else {
          const embed2 = new EmbedBuilder()
            .setColor(client.config.color)
            .setDescription(`Dj mode is currently disabled, please  enable it to use this command.`)
          if (!data.mode) return await interaction.reply(({ embeds: [embed2] }));
          const embed3 = new EmbedBuilder()
            .setColor(client.config.color)
            .setDescription(`The role ${role} is already added to dj role(s).`)
          if (data.roles.includes(role.id)) return await interaction.reply(({ embeds: [embed3] }));
          data.roles.push(role.id);
          data.moderator = interaction.user.id,
            data.lastUpdated = Math.round(Date.now() / 1000);
          await data.save();
          const embed4 = new EmbedBuilder()
            .setColor(client.config.color)
            .setDescription(`${client.config.emojis.success} Successfully added the role ${role} to dj role(s).`)
          await interaction.reply(({ embeds: [embed4] }));
        }
        break;
      case "clear":
        const embed5 = new EmbedBuilder()
          .setColor(client.config.color)
          .setDescription(`There is no dj role data to clear.`)
        if (!data) return await interaction.reply(({ embeds: [embed5] }));

        await data.delete();
        const embed6 = new EmbedBuilder()
          .setColor(client.config.color)
          .setDescription(`${client.config.emojis.success} Successfully cleared all dj role data.`)
        await interaction.reply(({ embeds: [embed6] }));
        break;
      case "toggle":
        const embed7 = new EmbedBuilder()
          .setColor(client.config.color)
          .setDescription(`There is no dj role dataTo.`)
        if (!data) return await interaction.reply(({ embeds: [embed7] }));
        let m = false;
        if (!data.mode) m = true;

        data.mode = m;
        await data.save();
        if (m) {
          const embed8 = new EmbedBuilder()
            .setColor(client.config.color)
            .setDescription(`${client.config.emojis.success} Successfully enabled dj mode.`)
          await interaction.reply(({ embeds: [embed8] }));
        } else {
          const embed9 = new EmbedBuilder()
            .setColor(client.config.color)
            .setDescription(`${client.config.emojis.success} Successfully disabled dj mode.`)
          await interaction.reply(({ embeds: [embed9] }));
        }
        break;
      case "remove":
        const embed10 = new EmbedBuilder()
          .setColor(client.config.color)
          .setDescription(`There is no dj role data to remove.`)
        if (!data) return await interaction.reply(({ embeds: [embed10] }));
        const embed11 = new EmbedBuilder()
          .setColor(client.config.color)
          .setDescription(`Don't have any dj role(s) remove`)
        if (!data.roles.length || data.roles.length <= 0) return await interaction.reply(({ embeds: [embed11] }));
        const roleNumber = interaction.guild.roles.cache.get(interaction.options.getRole("roles").id);
        const embed12 = new EmbedBuilder()
          .setColor(client.config.color)
          .setDescription(`Please provide a valid role.`)
        if (roleNumber > data.roles.length) return await interaction.reply(({ embeds: [embed12] }));

        data.roles.splice(roleNumber - 1, 1);
        await data.save();
        const embed13 = new EmbedBuilder()
          .setColor(client.config.color)
          .setDescription(`${client.config.emojis.success} Successfully removed the  **${roleNumber}** role from dj role(s).`)
        await interaction.reply(({ embeds: [embed13] }));
        break;
      case "list":
        const embed14 = new EmbedBuilder()
          .setColor(client.config.color)
          .setDescription(`There is no dj role data to list.`)
        if (!data) return await interaction.reply(({ embeds: [embed14] }));
        const embed15 = new EmbedBuilder()
          .setColor(client.config.color)
          .setDescription(`Don't have any dj role(s) to list.`)
        if (!data.roles.length || data.roles.length <= 0) return await interaction.reply(({ embeds: [embed15] }));

        let roles = [];
        for (const r of data.roles) {
          let x = interaction.guild.roles.cache.get(r);
          if (x) roles.push(x);
        };
        let pagesNum = Math.ceil(roles.length / 10);
        if (pagesNum === 0) pagesNum = 1;

        const pages = [];
        let n = 1;
        for (let i = 0; i < pagesNum; i++) {
          const str = `${roles.slice(i * 10, i * 10 + 10).map(list => `**${n++}** ~ @${list.name}`).join('\n')}`;

          let embed1 = client.embed().setColor(client.config.color).setDescription(str).setTitle(`Dj Role(s)`).setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({}) }).setFooter({ text: `Page ${i + 1}/${pagesNum} | ${roles.length} Total` });

          pages.push(embed1);
        }
        paginate(client, interaction, pages);
        break;
      case "info":
        const embed16 = new EmbedBuilder()
          .setColor(client.config.color)
          .setDescription(`There is no dj role data to show.`)
        if (!data) return await interaction.reply(({ embeds: [embed16] }));
        let roles2 = [];

        for (let r of data.roles) {
          let x = interaction.guild.roles.cache.get(r);
          if (x) roles2.push(x.name);
        };

        let e;
        if (roles2.length > 50) e = `${roles2.splice(0, 50).map((x) => `@${x}`).join(", ")}...`
        else if (roles2.length <= 0) e = "None";
        else e = roles2.map((x) => `@${x}`).join(", ");
        await interaction.reply({
          content: null,
          embeds: [client.embed().setColor(client.config.color).setTitle(`DJ Setup Info`).setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({}) }).addFields([
            {
              name: "Role",
              value: `${e}`,
              inline: true
            },

            {
              name: "Moderator",
              value: `<@${data.moderator}> (\`id: ${data.moderator}\`)`,
              inline: true
            },

            {
              name: "Last Updated",
              value: `<t:${data.lastUpdated}>`,
              inline: true
            },

            {
              name: "Dj Mode",
              value: `${data.mode ? `${this.client.config.emojis.online}` : `${this.client.config.emojis.offline}`}`
            },

            {
              name: "Available DJ Commands",
              value: `\`\`\`\n${client.commands.filter((x) => x.player.dj).map((x) => x.name).join(", ")}\n\`\`\``
            }
          ]).setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })]
        }).catch(() => { });
        break;
      case "member":
        const embed17 = new EmbedBuilder()
          .setColor(client.config.color)
          .setDescription(`There is no dj role data to show.`)
        if (!data) return await interaction.reply(({ embeds: [embed17] }));
        const embed18 = new EmbedBuilder()
          .setColor(client.config.color)
          .setDescription(`Don't have any dj role(s) to get the members.`)
        if (!data.roles.length || data.roles.length <= 0) return await interaction.reply(({ embeds: [embed18] }));


        let mb = [];
        for (let r of data.roles) {
          let role = interaction.guild.roles.cache.get(r);
          if (role) {
            role.members.forEach((x) => {
              if (!mb.includes(x.user.id)) mb.push(x.user.id);
            });
          };
        };

        let members;
        if (mb.length > 50) members = `${mb.splice(0, 50).map((x) => `<@${x}>`).join(", ")}...`;
        else if (mb.length <= 0) members = "None";
        else members = mb.map((x) => `<@${x}>`).join(", ");
        let embed21 = client.embed().setColor(client.config.color).setDescription(`${members}`).setTitle("Dj Member(s)");

        await interaction.reply({ content: null, embeds: [embed21] }).catch(() => { });
        break;

    }
  }
}