const config = require('config')
const SnowTransfer = require('snowtransfer')

module.exports = new SnowTransfer(config.discord.botToken)