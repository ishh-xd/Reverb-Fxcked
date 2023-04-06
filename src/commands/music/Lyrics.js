const Command = require('../../structures/Command');
const lyricsfinder = require("lyrics-finder");
const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js")

module.exports = class Lyrics extends Command {
  constructor(client) {
    super(client, {
      name: 'lyrics',
      description: {
        content: 'Displays the lyrics of the song.',
        usage: 'lyrics <song name>',
        examples: []
      },
      category: 'music',
      cooldown: 6,
      player: {
        voice: false,
        dj: false,
        active: false,
        djPerm: ["DeafenMembers"],
      },
      permissions: {
        dev: false,
        client: ["SendMessages", "ViewChannel", "EmbedLinks"],
        user: [],
      },
      options: [
        {
            name: "song",
            description: "Search lyrics for a specific song.",
            type: ApplicationCommandOptionType.String,
            required: false,
        },
    ],

    });
  }
  async run(client, interaction) {
    await interaction.deferReply({ ephemeral: false });

    const player = client.player.players.get(interaction.guildId);
    const value = interaction.options.getString("song");

    let song = value;
    let CurrentSong = player.queue.current;
    if (!song && CurrentSong) song = CurrentSong.title;

    let lyrics = null;

    const lyricError = new EmbedBuilder().setDescription(`${client.config.emojis.error} There is nothing playing.`).setColor('#ff0080');;

    try {
        lyrics = await lyricsfinder(song, "");
        if (!lyrics)
            return interaction.editReply({ embeds: [lyricError] }).then((msg) => {
                setTimeout(() => {
                    msg.delete();
                }, 12000);
            });
    } catch (err) {
        console.log(err);
        return interaction.editReply({ embeds: [lyricError] }).then((msg) => {
            setTimeout(() => {
                msg.delete();
            }, 12000);
        });
    }

    const lyricEmbed = new EmbedBuilder()
        .setTitle(`Lyrics for ${song}`)
        .setDescription(`${lyrics}`)
        .setColor('#ff0080');

    if (lyrics.length > 4096) {
        lyricEmbed.setDescription(`${client.config.emojis.error} The lyrics are too long to be displayed.`).setColor('#ff0080');;
        //lyricEmbed.setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 2048 }));
    }

    return interaction.editReply({ embeds: [lyricEmbed] });
}
};