const Button = require('../../structures/Button');
const Favorites = require('../../schemas/favorite.js');
const { EmbedBuilder, ButtonBuilder, CommandInteraction } = require('discord.js');

module.exports = class Favorite extends Button {
    constructor(client) {
      super(client, {
        id: 'FAVORITE_BUTTON',
      });
    }
      /**
   * 
   * @param {import('../../structures/Client').botClient} client 
   * @param {import('discord.js').CommandInteraction} interaction 
   * @param {String} color 
   * @returns 
   */
      async run(client, interaction, color) {
        const player = client.player.players.get(interaction.guild.id);
        if (!player) return;

        try {
          const embed = new EmbedBuilder()
          .setColor(color)
          .setDescription(`Successfully added [${player.queue.current.title}](${player.queue.current.uri}) to your favorites`)
          .setURL(player.queue.current.uri)

          const FavoriteData = await Favorites.findOne({ _id: interaction.user.id });

          if (!FavoriteData) {
            const newFavorite = new Favorites({
              _id: interaction.user.id,
              songs: [player.queue.current.uri]
            });
            await newFavorite.save();
          } else {
            if (FavoriteData.songs.includes(player.queue.current.uri)) {
              if (!interaction.replied) {
                return interaction.reply({ content: 'This song is already in your favorites' });
              } else {
                return interaction.editReply({ content: 'This song is already in your favorites' });
              }
            } else {
              FavoriteData.songs.push(player.queue.current.uri)
              await FavoriteData.save();
            }
          }

          if (!interaction.replied) {
            await interaction.reply({ embeds: [embed] });
          } else {
            await interaction.editReply({ embeds: [embed] });
          }
        } catch (e) {
          console.log(e)
          if (interaction.replied) {
            await interaction.reply({ content: 'Something went wrong while adding this song to your favorites' });
          } else {
            await interaction.editReply({ content: 'Something went wrong while adding this song to your favorites' });
          }
        }
      }
    };
  
