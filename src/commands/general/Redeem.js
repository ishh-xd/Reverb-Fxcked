const { EmbedBuilder, WebhookClient, PermissionsBitField } = require('discord.js');
const web = new WebhookClient({ url: 'https://discord.com/api/webhooks/1073883215070249002/SutDKhXqpt5xpQcpBnFWw_9l7jqWCCbkv1iN1TaWfukfV0_my4Grpp09Irttq18ovtVE' });
const schema = require('../../schemas/code');
const User = require('../../schemas/premium');
const Command = require('../../structures/Command');

module.exports = class Redeem extends Command {
    constructor(client) {
      super(client, {
        name: 'redeem',
        description: {
          content: "Redeems a premiun code.",
          usage: 'redeem',
          examples: ['redeem']
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
        options: [
          {
            name: 'code',
            description: "code",
            type: 3,
            required: true,
          }
        ],
      });
    }
    async run (client, interaction, args) {
      let code = interaction.options.getString("code");
        let user = await User.findOne({_id: interaction.user.id});
        if (!code)
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setColor(`#ff0080`)
                .setDescription(`Please specify the code you want to redeem`),
            ],
        });

        const Pcode = await schema.findOne({
            code: code.toUpperCase(),
        });
        if(!Pcode) { 
            return interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setColor(`#ff0080`)
                .setDescription(`${client.config.emojis.error} The code you provided is invalid!`),
            ],
            });
        };
        if (Pcode && user) {
        user.expireTime = user.expireTime + Pcode.times;
        let time = user.expireTime.toString().split("");
            time.pop();
            time.pop();
            time.pop();
            time = time.join("");
        
        user.isPremium = true
        user.redeemedBy = interaction.user.id
        user.redeemedAt = Date.now()
        user.plan = Pcode.plan,
        user.expireAt = user.expireTime,
        user.expireTime = user.expireTime

        user = await user.save({ new: true });
        await Pcode.deleteOne();

        let userembed = new EmbedBuilder()
        .setDescription(
            `${client.config.emojis.success} You have successfully redeemed premium!

            Redeemed by - <@${interaction.user.id}>
            Plan - ${Pcode.plan}
            Expires at: <t:${time}>(<t:${time}:R>)`)
        .setColor(`#ff0080`)

        interaction.reply({ embeds: [userembed] });
        web.send({embeds: [userembed]});
        } 
            else if(Pcode && !user) {
            let time = Pcode.expireTime.toString().split("");
                time.pop();
                time.pop();
                time.pop();
                time = time.join("");

            await User.create({
                _id: interaction.user.id,
                isPremium: true,
                redeemedBy : interaction.user.id,
                redeemedAt : Date.now(),
                plan: Pcode.plan,
                expireAt : Pcode.expireTime,
                expireTime: Pcode.expireTime
            });
            await Pcode.deleteOne().catch(() => {});
            let userembed = new EmbedBuilder()
            .setDescription(
                `${client.config.emojis.success} You have successfully redeemed premium!

                Redeemed By - <@${interaction.user.id}>
                Plan - ${Pcode.plan}
                Expires at: <t:${time}>(<t:${time}:R>)`)
            .setColor(`#ff0080`)
                interaction.reply({ embeds: [userembed] });
                web.send({embeds: [userembed]});
            };
    }
};
