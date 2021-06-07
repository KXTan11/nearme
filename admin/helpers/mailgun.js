let mailgun = null

var MailgunHelper = function (options) {
  this.apiKey = options.apiKey
  this.domain = options.domain
  this.host = options.host
  mailgun = require('mailgun-js')({
    apiKey: this.apiKey,
    domain: this.domain,
    host: this.host,
  })
}

MailgunHelper.prototype.send = (params) => {

  const data = {
    from: params.from,
    to: params.to,
    html: params.html,
    subject: params.subject,
  }

  return mailgun.messages().send(data)
}

module.exports.MailgunHelper = MailgunHelper
