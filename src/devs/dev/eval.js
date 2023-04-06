const Command = require('../../structures/Command')

module.exports = class EvalCommand extends Command {
  constructor(client) {
        super(client, {
            name: 'eval',
            descripdescriptiontion: {
                content: 'To check the bot\'s latency.',
                usage: 'ping',
                examples: ['ping'],
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
    async run(client, message, args) {
        const code = args.join(" ");
        if (!code) {
            return message.channel.send({ content: "Please provide a code to eval!" });
        }
        try {
            let evaled = await eval(code);
            if (typeof evaled !== "string") {
                evaled = require("node:util").inspect(evaled, { depth: 0 });
            }
            if (evaled.includes(client.config)) {
                evaled = evaled.replace(client.config, "CENSORED");
            }
            if (evaled.includes(client.config.token)) {
                evaled = evaled.replace(client.config.token, "CENSORED");
            }
            if (evaled.includes(client.config.mongodb)) {
                evaled = evaled.replace(client.config.mongodb, "CENSORED");
            }
            const splitDescription = evaled;
            return message.channel.send({
                content: `\`\`\`js\n${splitDescription}\n\`\`\``,
            });
        } catch (e) {
            console.log(e, "error")
            return message.channel.send({
                content: `\`\`\`js\n${e}\n\`\`\``,
            });
        }
    }
}