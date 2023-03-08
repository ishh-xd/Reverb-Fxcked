const express = require("express");
const url = require("url");
const path = require("path");
const { PermissionsBitField } = require("discord.js");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const Strategy = require("passport-discord").Strategy;
const config = require("../config.js");
const passport = require("passport");

module.exports = client => {
  //WEBSITE CONFIG BACKEND
  const app = express();
  const session = require("express-session");
  const MemoryStore = require("memorystore")(session);


  //Initalize the Discord Login
  passport.serializeUser((user, done) => done(null, user))
  passport.deserializeUser((obj, done) => done(null, obj))
  passport.use(new Strategy({
    clientID: config.clientId,
    clientSecret: config.clientSecret,
    callbackURL: config.Website + config.CallbackURL,
    scope: config.Scopes
  },
    (accessToken, refreshToken, profile, done) => {
      process.nextTick(() => done(null, profile))
    }
  ))

  app.use(session({
    store: new MemoryStore({ checkPeriod: 86400000 }),
    secret: `#@%#&^$^$%@$^$&%#$%@#$%$^%&$%^#$%@#$%#E%#%@$FEErfgr3g#%GT%536c53cc6%5%tv%4y4hrgrggrgrgf4n`,
    resave: false,
    saveUninitialized: false
  }))

  // MIDDLEWARES 
  app.use(passport.initialize());
  app.use(passport.session());

  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "./views"));


  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(express.json());
  app.use(express.urlencoded({
    extended: true
  }));

  //Loading css files
  app.use(express.static(path.join(__dirname, "./assets")));
  app.use("/css", express.static(__dirname + './assets/css'))
  app.use("/img", express.static(__dirname + './assets/img'))
  app.use("/js", express.static(__dirname + './assets/js'))
  app.use("/dashboard", express.static(__dirname + './assets/dashboard'))

  const checkAuth = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    req.session.backURL = req.url;
    res.redirect("/login");
  }

  app.get("/login", (req, res, next) => {
    if (req.session.backURL) {
      req.session.backURL = req.session.backURL
    } else if (req.headers.referer) {
      const parsed = url.parse(req.headers.referer);
      if (parsed.hostname == app.locals.domain) {
        req.session.backURL = parsed.path
      }
    } else {
      req.session.backURL = "/"
    }
    next();
  }, passport.authenticate("discord", { prompt: "none" })
  );

  app.get(config.CallbackURL, passport.authenticate("discord", { failureRedirect: "/" }), async (req, res) => {
    let banned = false //client.get("bannedusers")
    if (banned) {
      req.session.destroy()
      res.json({ login: false, message: "You are banned from the dashboard", logout: true })
      req.logout();
    } else {
      res.redirect("/dashboard")
    }
  });

  app.get("/logout", function(req, res, next) {
    req.logout(function(err) {
      if (err) {
        return next(err);
      }
      req.session.destroy()
      res.redirect('/');
    });
  })

  app.get("/", (req, res) => {
    res.render("index", {
      req: req,
      user: req.isAuthenticated() ? req.user : null,
      client: client,
    })
  })

  app.get("/invite", (req, res) => {
    res.render("invite");
  });

  app.get("/support", (req, res) => {
    res.render("support");
  });

  app.get("/vote", (req, res) => {
    res.render("vote");
  });

   app.get("/invite", (req, res) => {
    res.render("invite");
  });

  app.get("/about", (req, res) => {
    res.render("about", {
      req: req,
      user: req.isAuthenticated() ? req.user : null,
      client: client,
    })
  });

  app.get("/commands", (req, res) => {
    res.render("commands", {
      req: req,
      user: req.isAuthenticated() ? req.user : null,
      client: client,
    })
  });

  app.get("/terms", (req, res) => {
    res.render("terms", {
      req: req,
      user: req.isAuthenticated() ? req.user : null,
      client: client,
    })
  });

  app.get("/privacy", (req, res) => {
    res.render("privacy", {
      req: req,
      user: req.isAuthenticated() ? req.user : null,
      client: client,
    })
  });

  app.get("/guide", (req, res) => {
    res.render("guide", {
      req: req,
      user: req.isAuthenticated() ? req.user : null,
      client: client,
    })
  });

  app.get("/faqs", (req, res) => {
    res.render("faqs", {
      req: req,
      user: req.isAuthenticated() ? req.user : null,
      client: client,
    })
  });

  app.get("/dashboard", (req, res) => {
    if (!req.user) {
      res.render("401", {
        req: req,
        user: req.isAuthenticated() ? req.user : null,
        client: client,
      })
    } else {
      res.render("dashboard", {
        req: req,
        user: req.isAuthenticated() ? req.user : null,
        client: client,
        Permissions: PermissionsBitField,
      })
    }
  })

  app.get("/dashboard/:guildID", checkAuth, async (req, res) => {
    const Guild = await client.guilds.fetch(req.params.guildID)

    if (!Guild) {
      return res.render("noguild", {
        req: req,
        user: req.isAuthenticated() ? req.user : null,
        client: client,
      })
    }

    const Member = await Guild.members.fetch(req.user.id)

    if (!Member) {
      return res.render("401", {
        req: req,
        user: req.isAuthenticated() ? req.user : null,
        client: client,
      })
    }

    if (!Member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return res.render("403", {
        req: req,
        user: req.isAuthenticated() ? req.user : null,
        client: client,
      })
    }

    return res.render("settings", {
      req: req,
      user: req.isAuthenticated() ? req.user : null,
      guild: Guild,
      client: client,
      Permissions: PermissionsBitField,
      config: config.Website,
      callback: config.CallbackURL,
    })
  })

  app.use(function(req, res) {
    if (res.status(404)) {
      return res.render("404", {
        req: req,
        user: req.isAuthenticated() ? req.user : null,
        client: client,
      })
    }
  });

  const http = require("http").createServer(app);
  http.listen(config.Port, () => {
    client.logger.ready(`Website is online on the Port: ${config.Port}, ${config.Website}`);
  });
}