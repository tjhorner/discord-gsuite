const config = require('config')
const GoogleStrategy = require('passport-google-oauth20')

let authorizationURL = "https://accounts.google.com/o/oauth2/v2/auth"

if(config.google.allowedDomains.length === 1)
  authorizationURL += `?hd=${config.google.allowedDomains[0]}`

module.exports = new GoogleStrategy({
  clientID: config.google.clientId,
  clientSecret: config.google.clientSecret,
  callbackURL: `${config.host}/oauth/google/callback`,
  authorizationURL,
  scope: config.google.scopes
}, (_, _, profile, cb) => {
  cb(null, profile)
})