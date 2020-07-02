const config = require('config')

const express = require('express')
const passport = require('passport')
const session = require('express-session')
const expressLayouts = require('express-ejs-layouts')

const discordStrategy = require('./strategies/discord')
const googleStrategy = require('./strategies/google')

const discordBot = require('./lib/discordbot')

const app = express()

app.set("view engine", "ejs")

app.use(express.static("public"))
app.use(expressLayouts)

app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: true
}))

app.use(passport.initialize())

passport.use(discordStrategy)
passport.use(googleStrategy)

app.get("/", (req, res) => {
  let locals = {
    domain: config.google.allowedDomains[0]
  }

  if(req.session.linked) {
    res.render("steps/done", locals)
  } else if(req.session.googleUser) {
    locals.name = req.session.googleUser.name.givenName
    res.render("steps/discord", locals)
  } else {
    res.render("steps/google", locals)
  }
})

app.get("/oauth/google", passport.authenticate("google"))
app.get("/oauth/google/callback", passport.authenticate("google", {
  session: false,
  failureRedirect: "/"
}), (req, res) => {
  if(req.user && !config.google.allowedDomains.includes(req.user._json.hd)) {
    res.render("error", {
      error: `You did not log in with a Google account from one of these allowed domains: ${config.google.allowedDomains.join(", ")}`
    })
    return
  }

  req.session.googleUser = req.user
  res.redirect("/")
})

function ensureGoogleAuth(req, res, next) {
  if(!req.session.googleUser) {
    res.redirect("/")
    return
  }

  next()
}

app.get("/oauth/discord", ensureGoogleAuth, passport.authenticate("discord"))
app.get("/oauth/discord/callback", ensureGoogleAuth, passport.authenticate("discord", {
  session: false,
  failureRedirect: "/"
}), async (req, res) => {
  try {
    if(!req.user.guilds.some(g => g.id === config.discord.targetGuildId)) {
      await discordBot.guild.addGuildMember(config.discord.targetGuildId, req.user.id, {
        access_token: req.user.accessToken
      })
    }
  
    await discordBot.guild.updateGuildMember(config.discord.targetGuildId, req.user.id, {
      nick: req.session.googleUser.displayName,
      roles: [ config.discord.targetRoleId ]
    })
  } catch(e) {
    console.error(e)

    res.render("error", {
      error: "We were unable to add you to the server and update your role. Make sure you grant the requested permissions."
    })
    return
  }

  req.session.discordUser = req.user
  req.session.linked = true
  res.redirect("/")
})  

app.listen(config.port)