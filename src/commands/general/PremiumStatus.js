const { EmbedBuilder, WebhookClient, PermissionsBitField } = require('discord.js');
const moment = require("moment");
const Data = require('../../schemas/premium');
const Command = require('../../structures/Command');
module.exports = class PremiumStatus extends Command {
    constructor(client) {
      super(client, {
        name: 'premium-status',
        description: {
          content: "premium status",
          usage: 'premium status',
          examples: ['premium status']
        },
        category: 'Info',
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
        options: [],
      });
    }
    async run (client, interaction, color, args) {
 
     await interaction.deferReply({ ephemeral: false });

        const User = await Data.findOne({ _id: interaction.user.id });

        const embed = new EmbedBuilder()
            .setAuthor({
                name: `${interaction.user.tag} Premium Information`,
                iconURL: client.user.displayAvatarURL({ dynamic: true }),
            })
        
            .setDescription(`Here are the details about your premium status of ${client.user}.`)
            .setThumbnail(interaction.user.displayAvatarURL())
            .setColor(color)
        if (!User) {
            embed.addFields([
                { name: `Plan:`, value: `\`\`\`${toOppositeCase("Free")}\`\`\``, inline: true },
                { name: `Expires at:`, value: `\`\`\`Never\`\`\``, inline: true },
                { name: `Features:`, value: `\`\`\`Locked\`\`\``, inline: true },
            ]);
        } else {
            if (User.isPremium) {
                if (User.plan === "lifetime") {
                    embed.addFields([
                        { name: `Plan:`, value: `\`\`\`${toOppositeCase("Premium")}\`\`\``, inline: true },
                        { name: `Expires at:`, value: `\`\`\`Never\`\`\``, inline: true },
                        { name: `Features:`, value: `\`\`\`Unlocked\`\`\``, inline: true },
                    ]);
                }
                const timeLeft = moment(User.expireAt).format("dddd, MMMM Do YYYY HH:mm:ss");
                embed.addFields([
                    { name: `Plan:`, value: `\`\`\`${toOppositeCase("Premium")}\`\`\``, inline: true },
                    { name: `Expires at:`, value: `\`\`\`${timeLeft}\`\`\``, inline: true },
                    { name: `Features:`, value: `\`\`\`Unlocked\`\`\``, inline: true },
                ]);
            }
        }

        return interaction.editReply({ embeds: [embed] });
    }
};

function toOppositeCase(char) {
    return char.charAt(0).toUpperCase() + char.slice(1);
}  
