const { EmbedBuilder, WebhookClient, PermissionsBitField } = require('discord.js');
const web = new WebhookClient({ url: 'https://discord.com/api/webhooks/1073883215070249002/SutDKhXqpt5xpQcpBnFWw_9l7jqWCCbkv1iN1TaWfukfV0_my4Grpp09Irttq18ovtVE' });
const schema = require('../../schemas/code');
const User = require('../../schemas/premium');
const Command = require('../../structures/Command');

module.exports = class RemovePremium extends Command {
    constructor(client) {
      super(client, {
        name: 'remove-premium',
        description: {
          content: "remove premiun.",
          usage: 'remove-redeem',
          examples: ['remove-premium']
        },
        category: 'dev',
        cooldown: 3,
        permissions: {
          dev: true,
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
            name: 'user',
            description: "user to remove premium from.",
            type: 6,
            required: true,
          }
        ],
      });
    }
    async run (client, interaction, args) {
      const user = interaction.options.getUser("user");
        
  const data = await  User.findOne({_id: user.id})
  
  if(!data){
   let userembed12 = new EmbedBuilder()
        .setDescription(
            `${client.config.emojis.success} \`${user.tag}\` does not have any premium plan.`)
       .setColor(`#ff0080`)

       
 return interaction.reply({ embeds: [userembed12] });
  }
          
        if(data){
   if(!data.isPremium){
   let userembed1 = new EmbedBuilder()
        .setDescription(
            `${client.config.emojis.success} \`${user.tag}\` does not have any premium plan.`)
       .setColor(`#ff0080`)

       
 return interaction.reply({ embeds: [userembed1] });
  }}    
      
        if(data){
      if(data.isPremium){
       await User.deleteOne({_id: user.id})
      }
          }
          
        let userembed = new EmbedBuilder()
        .setDescription(
            `${client.config.emojis.success} You have successfully removed premium from \`${user.tag}\`.`)
        .setColor(`#ff0080`)

        interaction.reply({ embeds: [userembed] });
        
            
                
    }
};