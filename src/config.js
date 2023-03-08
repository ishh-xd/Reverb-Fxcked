module.exports = {
  token: "OTYzODQ2MzgxNDEwMzI0NTEw.GmXFGm.MQdgrkKTf2sFL4T-ZdhKMJQvQ6CcjFXTAkov60",
  clientId: "963846381410324510",
   clientSecret: "rVEjAo4Hw-8n9ukiT6DDxXn-YTNkDH7I",
  Scopes: ["identify", "guilds"],
  CookieSecret: "PlayerOP", //anythiing you want
  CallbackURL: "/api/callback", //Discord API Callback url. Do not touch it if you don't know what you are doing. All you need to change for website to work is on line 20.
  Dashboard: true, //If you wanted to make the website run or not, default is true
  Port: 25565, //Which port website gonna be hosted
  Website: process.env.Website || "https://reverbmusic.live",
  devs: [
    "931645484920107088",
    "990643162928279592",
    "797438292139180035"
  ],
  mongodb: "mongodb+srv://insane:op1@cluster0.4eqsq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
  color: "#ff0080",
  prefix: "r!",
  statcord: "statcord.com-Ldavt8ONUAig6GUZtcMm",
  nodes: [
    {
      url: "hatkidll.gremagol.xyz:2334",
      auth: "easypass",
      name: "Reverb",
      secure: false
    },
  ],
  spotify: {
    client_id: "d1a82ecd4f2a47749495dc0e25adc9a9",
    client_secret: "76ae2db15eed4371ab5cbeba8de3b01b",
  },
  cmdId: {
    help: '</help:964545843208261633>',
    play: '</play:980845334764875873>',
    skip: '</skip:979321542167105561>',
    resume: '</resume:980845334848733186>',
    commands: '</commands:980297975186194463>',
    setup: '</setup create:1016203145661141122>',
    plc: '</playlist-create:1019936819552469000>',
    pla: '</playlist-add:1019936819552468997>',
    plr: '</playlist-remove:1019936819862843436>',
  },
  bemoji: {
    voldown: "981951103098843146",
    volup: "981951274595516497",
    next: "981954187770343444",
    previous: "981951921688543272",
    rewind: "981951921688543272",
    forward: "981954187770343444",
    stop: "981951565504073838",
    play: "981953808844357653",
    pause: "981953953803694090",
    infinity: "1030788291882127390",
    loop: "981954057470095371",
    music_em: '981943082650067004',
    filters_em: '981954306121039942',
    settings_em: '981943882025668638',
    playlist_em: '981942799656190024',
    general_em: '981943723384508416',
  },
  emojis: {
    music_em: '<:musicalnote:981943082650067004>',
    filters_em: '<:filter:981954306121039942> ',
    settings_em: '<:settings:981943882025668638>',
    playlist_em: '<:playlist:981942799656190024>',
    general_em: '<:homepage:981943723384508416>',
    search: "🔍",
    ping: "🏓",
    error: "<:cross:1027492037928427520>",
    success: "<:check:1027490972898168842>",
    voice: "<:highvolume:981951390769352795>",
    left: "<:previous:981962372950392842>",
    right: "<:skip:981951679933067274>",
    x: "<:stop:981951565504073838>",
    previous: '<:previous:981962372950392842>',
    next: '<:skip:981951679933067274>',
    typing: "<a:loading:1027493151033802773>",
    gif: "<:musicalnote2:981955432526520351>",
    png: "<:musicalnote2:981955432526520351>",
    offline: '<:offline:931838458081710081>',
    online: '<:online:931837826058821656>',
    track: "<:musicalnote:981943082650067004>",
    disconnect: "<:disconnect:1022472546060337163>",
    playlists: "<:playlist:981942799656190024>",
    progress1: "<:1_1:1027494428056748054>",
    progress2: "<:1_2:1027494733016211487>",
    progress3: "<:1_3:1027496956194455562>",
    progress4: "<:1_4:1027497283455033354>",
    progress5: "<:blank:1027497884549128232>",
    progress6: "<:1_6:1027498321763381278>",
    progress7: "<:1_7:1027498935037743104>",
    progress8: "<:1_8:1027499441822904361>"
  },
  img: {
    png: 'https://i.imgur.com/tcG074r.png',
    gif: 'https://i.imgur.com/rvVp2Zd.gif',
  },
  links: {
    invite: "https://discord.com/oauth2/authorize?client_id=910042269657231432&permissions=414530792776&scope=bot%20applications.commands",
    image: "https://cdn.discordapp.com/attachments/936524382501765140/996040987220643942/reverb_banner_pink.png",
    server: "https://discord.gg/v35HcMDa"
  },
  botlist: {
    topgg: "https://top.gg/bot/910042269657231432",
    dbl: "https://discordbotlist.com",
    token: {
      topgg: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjkxMDA0MjI2OTY1NzIzMTQzMiIsImJvdCI6dHJ1ZSwiaWF0IjoxNjU3OTkzNDY2fQ.NMXNDXWmpXdARgVm0Ar6za7nBl0K2dIz7q-vxf3olWY",
      discords: "asd",
      dbl: "asd"
    }
  },
  setup: {
    channel: {
      topic: "🔉 To decrease 10% volume.\n⏮️ To play the previously played song.\n⏯️ To pause/resume the song.\n⏭️ To skip the song.\n🔊 To increase 10% volume.\n⏪ To rewind 10s seconds.\n♾️To enable/disable autoplay.\n⏹️ To stops/destroy the player.\n🔁 Tp switch between the loop modes (track/queue/shuffle).\n⏩ To forward 10 seconds.",
    }
  },
  hooks: {
    cmd: {
      url: "https://discord.com/api/webhooks/997884236159795301/fJ-quVDWLlUdBlo8DEHkUd6Bk87El9388eU1MEq2yQfMc3nsS5LRh1oguFwPQZENhMT8"
    },
    errors: {
      url: "https://discord.com/api/webhooks/972136992529866752/qvMCEIpOlfw2ml2KQjg22GnoU6CWJlV_gUmSeitM0CP97-nBsltxtU1VYYkyZ5psTOkP"
    },
    lavalink: {
      url: "https://discord.com/api/webhooks/1029435055652741162/aekDabV_RlZAkNCMCo1e0M1Ee3eOQhs8vphUkv5tyLWzb7yO0rxmC6hIPJC47cIXFZKH"
    },
    guildAdd: {
      url: "https://discord.com/api/webhooks/1029434616957915206/N0zh6t9PSxpcl6Z24A0jsSLUkJTgXwFQv7D8755vUnWgzp68NiThEB-DbbdvAbtPsTAD"
    },
    guildRemove: {
      url: "https://discord.com/api/webhooks/1029434701737365556/lDvPKqP5BcU4xqNFSV5dFJcmWPunx1_XuMyAZD2lNsg9cjXNCWV6UzJJuuHVxS3yukX2"
    },
    event: {
      url: "https://discord.com/api/webhooks/1029351297004081162/VQ0i97cqxY9iNQiQBjYon0o2YLeM2kAohYOJaoJ9U11BRQyhgLevEerQsK-QUq-V9BgW"
    },
    playercreate: {
      url: "https://discord.com/api/webhooks/996717129963425812/H1FfpOz7r0P7pwRPACKq-stKR5djMFj5qZJwrOyqjAh1r8h4j8oDbOoK4wGYolz9WT8d"
    },
    playerdestroy: {
      url: "https://discord.com/api/webhooks/996717215514632282/c0sc_rEMcwa5Euc27vvD41tEMQGTpa13GIIbExaBpn17dAZEM3G6g4QtZAj2SgDMlmI3"
    }
  }
}