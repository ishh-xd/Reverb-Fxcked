const { EmbedBuilder } = require('discord.js');
const schema = require('../../schemas/code');
const moment = require('moment');
let voucher_codes = require('voucher-code-generator');
const Command = require('../../structures/Command');

module.exports = class Generate extends Command {
    constructor(client) {
        super(client, {
            name: 'generate',
            description: {
                content: 'To check the bot\'s latency.',
                usage: 'generate',
                examples: ['generate'],
            },
            category: 'dev',
            cooldown: 3,
            permissions: {
                dev: true,
                client: ['SendMessages', 'ViewChannel', 'EmbedLinks'],
                user: [],
            },
            player: {
                voice: false,
                dj: false,
                active: false,
                djPerm: null,
            }
        });
    }
    async run (client, message, args) {
    let codes = [];
    const plan = args[0];
    const plans = ['1-month', '3-months', '1-year'];
    if (!plan) return message.reply({ embeds: [new EmbedBuilder()
        .setColor(`#ff0080`)
        .setDescription(`${client.config.emojis.error} Please provide a premium plan \navailable plans: ${plans.join(', ')}`)]})
    
    if (!plans.includes(args[0]))
    return message.reply({ embeds: [new EmbedBuilder()
        .setColor(`#ff0080`)
        .setDescription(`${client.config.emojis.error} Invalid plan \navailable plans: ${plans.join(', ')}`)]})

    let time
    if (plan === '1-month') time = 1 * 2678400000
    if (plan === '3-months') time = 3 * 2678400000
    if (plan === '1-year') time = 12 * 2678400000

    let ftime = Date.now()+time;

    let amount = args[1];
    if (!amount) amount = 1;

    for (var i = 0; i < amount; i++) {
    const codePremium = voucher_codes.generate({
        pattern: '######-######-######-######-######'
    })

    const code = codePremium.toString().toUpperCase();

    const find = await schema.findOne({
        code: code
    });
    
    if (!find) {
        const newdb = new schema({
            code: code,
            expireAt: ftime,
            plan: plan,
            expireTime : ftime,
            times: time
        })

        await newdb.save();

        const find2 = await schema.findOne({
            code: code
        });

        console.log(find2)

        codes.push(`${i + 1}- ${code}`);
    };
};
    message.reply({embeds: [new EmbedBuilder()
        .setColor(client.config.color)
        .setDescription(`${client.config.emojis.success} Successfully generated ${codes.length} code(s)

        \`\`\`${codes.join('\n')}\`\`\`
        Plan - ${plan}
        Expires at ${moment(ftime).format('dddd, MMMM Do YYYY')}`)]})
    
    }
};
