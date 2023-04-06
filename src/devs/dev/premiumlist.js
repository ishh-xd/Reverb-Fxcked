const { EmbedBuilder, WebhookClient, PermissionsBitField } = require('discord.js');
const web = new WebhookClient({ url: 'https://discord.com/api/webhooks/1073883215070249002/SutDKhXqpt5xpQcpBnFWw_9l7jqWCCbkv1iN1TaWfukfV0_my4Grpp09Irttq18ovtVE' });
const schema = require('../../schemas/code');
const User = require('../../schemas/premium');
const Command = require('../../structures/Command');
const { paginate } = require('../../handlers/functions');

module.exports = class PremiumList extends Command {
    constructor(client) {
        super(client, {
            name: 'premiumlist',
            description: {
                content: 'premiumlist',
                usage: 'premiumlist',
                examples: ['premiumlist'],
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
        /*
  
  const dataset = await  User.find({isPremium: true })
    
   
  
     
     let display = [];
  let show = await dataset.forEach((x)=>{
   display.push(`${client.config.emojis.success} **User: ${x.id}**\nPlan: \`${x.plan}\`\nExpire: <t:${x.expireTime}:R>`)
  })
  
        */
          
  const dataset = await  User.find({isPremium: true })
    
   
  
  let display = [];
  
      for (let i = 0; i < dataset.length; i++) {
  let lol = dataset[i]
  display.push(`${client.config.emojis.success} **User: ${lol.id}**\nPlan: \`${lol.plan}\`\nExpire: <t:${lol.expireTime}:R>`)
          
      }
    
    let pagesNum = Math.ceil(display / 5);
          if (pagesNum === 0) pagesNum = 1;
  
          const pages = [];
          for (let i = 0; i < pagesNum; i++) {
              const str = display.slice(i * 5, i * 5 + 5).join('\n\n');
              let embed = client.embed()  
                  .setColor(client.config.color)
                  .setTitle(`Premium Users:`)
                  .setDescription(`${str == '' ? 'No premium user found.' : `\n${str}`}`)
                  .setFooter({ text: `Page: ${i + 1}/${pagesNum}` });
              pages.push(embed);
          }
          
  
          paginate(client, message, pages, 800000);
  
         
              
                  
      }
  };
