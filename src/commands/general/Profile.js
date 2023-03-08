const Command = require('../../structures/Command');
const { PermissionsBitField, ActionRowBuilder, EmbedBuilder } = require('discord.js');

module.exports = class Profile extends Command {
  constructor(client) {
    super(client, {
      name: 'profile',
      description: {
        content: "Shows the profile of a user.",
        usage: 'profile',
        examples: ['profile']
      },
      category: 'info',
      cooldown: 3,
      permissions: {
        dev: false,
        client: [PermissionsBitField.SendMessages, PermissionsBitField.ViewChannel, PermissionsBitField.EmbedLinks],
        user: [],
      },
      player: {
        voice: false,
        dj: false,
        active: false,
        djPerm: null,
      },
      options: [
        {
          name: 'member',
          description: "member who's profile you want.",
          type: 6,
          required: false,
        }
      ],
    });
  }

  async run(client, interaction, args) {

    let user;
    let option = interaction.options.getUser("member");
    if (option) {
      user = option
      if (!user) {
        const embed = new EmbedBuilder()
          .setColor(client.config.color)
          .setDescription(`Invalid user.`)
        return interaction.reply({ embeds: [embed] });

      }
      if (user.bot) {
        const embed1 = new EmbedBuilder()
          .setColor(client.config.color)
          .setDescription(`The user must not be a bot.`)
        return interaction.reply({ embeds: [embed1] });
      }
    } else {
      user = interaction.user;
    }
    const getUserBadges = async () => {
      const { badges } = await client.cluster.evalOnCluster(
        async (c, { customEmojiAllowed, userId }) => {
          let badges = [];
          let guild = await c.guilds.fetch("931942695084113980");
          let member = await guild.members.fetch(userId);
          if (member.roles.cache.has("931942695096713256")) {
            badges.push(
              ...[
                `${customEmojiAllowed ? "<:owner:1029072606843916329>" : "👑"
                } Owner`,
                `${customEmojiAllowed ? "<:developer:1029073349260869712>" : "⌨️"
                } Developer`,
              ]
            );
          }
          if (member.roles.cache.has("931942695084113987")) {
            badges.push(
              `${customEmojiAllowed ? "<:staff:1029075013556518982>" : "⚒️"
              } Staff`
            );
          }
          if (member.roles.cache.has("980034164722118706")) {
            badges.push(
              `${customEmojiAllowed ? "<:discordpartner:1029076178293751930>" : "🪛"
              } Contributor`
            );
          }
          if (member.roles.cache.has("931942695084113985")) {
            badges.push(
              `${customEmojiAllowed ? "<:earlysupporter:1029077379995410533>" : "🤝"
              } Supporter`
            );
          }
          if (member.roles.cache.has("931942695084113984")) {
            badges.push(
              `${customEmojiAllowed ? "<:diamond:1029080818343223359>" : "💎"} VIP`
            );
          }
          if (member.roles.cache.has("961571874825977927")) {
            badges.push(
              `${customEmojiAllowed ? "<:voter:1029081490186846319>" : "🤝"
              } Voter`
            );
          }

          return {
            success: true,
            badges: badges.length
              ? `\n${badges.join("\n")} `
              : "\nNo achievements.",
          };
        },
        {
          context: {
            customEmojiAllowed: !!(
              interaction.guild.members.me.permissions.has(
                PermissionsBitField.Flags.UseExternalEmojis
              ) &&
              interaction.channel
                .permissionsFor(interaction.guild.members.me)
                .has(PermissionsBitField.Flags.UseExternalEmojis) &&
              interaction.guild.roles.everyone.permissions.has(
                PermissionsBitField.Flags.UseExternalEmojis
              ) &&
              interaction.channel
                .permissionsFor(interaction.guild.roles.everyone)
                .has(PermissionsBitField.Flags.UseExternalEmojis)
            ),
            userId: user.id,
          },
          guildId: "931942695084113980",
        }
      );
      return badges;
    };
    const badges = await getUserBadges();
    const embed2 = new EmbedBuilder()
      .setColor(client.config.color)
      .setAuthor({
        name: `Achievements of ${user.tag}`,
        url: "https://discord.gg/UxuQuAYKTe",

      })
      .setDescription(`${badges}\n`)
      .setThumbnail(user.avatarURL({ dynamic: true }))
      .setFooter({
        text: `Requested By ${interaction.member.user.tag} `,
        iconURL: interaction.member.displayAvatarURL({ dynamic: true }),
      })
      .setTimestamp()
    return interaction.reply({ embeds: [embed2] });
  }
};
