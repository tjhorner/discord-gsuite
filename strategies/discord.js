const config = require('config')
const DiscordStrategy = require('passport-discord')

module.exports = new DiscordStrategy({
  clientID: config.discord.clientId,
  clientSecret: config.discord.clientSecret,
  callbackURL: `${config.host}/oauth/discord/callback`,
  scope: config.discord.scopes
}, (accessToken, refreshToken, profile, cb) => {
  cb(null, profile)
})