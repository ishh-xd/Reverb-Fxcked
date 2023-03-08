const Command = require("../../structures/Command");
const { convertTime } = require('../../utils/convert')
const { paginate } = require('../../handlers/functions');

module.exports = class Queue extends Command {
    constructor(client) {
        super(client, {
            name: "queue",
            description: {
                content: "Shows the current queue.",
                usage: "queue",
                examples: []
            },
            category: 'music',
            cooldown: 6,
            player: {
                voice: true,
                dj: false,
                active: true,
                djPerm: null,
            },
            permissions: {
                dev: false,
                client: ["SendMessages", "ViewChannel", "EmbedLinks"],
                user: [],
            },
            options: [
                {
                    name: "page",
                    type: 4,
                    required: false,
                    description: "The queue page number."
                }
            ],
        })
    }
    async run(client, interaction) {
        let page = interaction.options.getInteger("page")
        let player = client.player.players.get(interaction.guildId);
        const { title, requester, length, uri } = player.queue.current;
        const parsedQueueDuration = convertTime(player.queue.reduce((acc, cur) => acc + cur.length, 0));

        let pagesNum = Math.ceil(player.queue.length / 10);
        if (pagesNum === 0) pagesNum = 1;

        const songStrings = [];
        for (let i = 0; i < player.queue.length; i++) {
            const song = player.queue[i];
            songStrings.push(`**${i + 1}.** [${song.title}](${song?.uri}) • ${convertTime(song.length)} • <@${song.requester.id}>\n`);
        }
        const user = `<@${requester.id}>`;
        const pages = [];
        for (let i = 0; i < pagesNum; i++) {
            const str = songStrings.slice(i * 10, i * 10 + 10).join('');
            let embed = client.embed()
                .setColor(client.config.color)
                .setTitle(`${interaction.guild.name} server's queue`)
                .setDescription(`**Currently playing:** [${title}](${uri}}) • ${convertTime(length)} • ${user}.\n\n**Up next**:${str == '' ? '  Nothing' : `\n${str}`}`)
                .setFooter({ text: `Page ${i + 1}/${pagesNum} | ${player.queue.length} track(s) |  total duration - ${parsedQueueDuration}` });
            pages.push(embed);
        }
        if (page) {
            if (isNaN(page)) return interaction.reply('Page value must be a number.');
            if (page > pagesNum) return interaction.reply(`There are only ${pagesNum} pages available.`);
            const pageNum = page == 0 ? 1 : page - 1;
            return interaction.reply({ embeds: [pages[pageNum]] });
        } else {
            paginate(client, interaction, pages, 800000);

        }
    }
}