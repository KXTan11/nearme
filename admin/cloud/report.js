const MailgunHelper = require('../helpers/mailgun').MailgunHelper
const Mailgen = require('mailgen')

Parse.Cloud.beforeSave('Report', async (req) => {

  const obj = req.object
  const user = req.user

  if (!user) throw 'Not Authorized'

  if (!obj.existed()) {
    const acl = new Parse.ACL()
    acl.setPublicReadAccess(false)
    acl.setRoleReadAccess('Admin', true)
    acl.setRoleWriteAccess('Admin', true)
    obj.setACL(acl)
    obj.set('reportedBy', user)
  }

})

Parse.Cloud.afterSave('Report', async (req) => {

  let obj = req.object

  // Send email notification when a user reports a listing

  if (!obj.existed()) {

    const queryConfig = new Parse.Query('AppConfig')

    const config = await queryConfig.first({
      useMasterKey: true
    })

    const emailConfig = config.get('email')

    const toAddress = emailConfig.addressForNotifications

    await obj.fetchWithInclude(['place', 'reportedBy'], {
      useMasterKey: true
    })

    let attrs = obj.attributes

    const subject = __('EMAIL_REPORT_SUBJECT')
    const title = __('EMAIL_REPORT_TITLE')

    const reportedBy = attrs.reportedBy

    let body = __('EMAIL_REPORT_BODY')
    body = body.replace('%PLACE_NAME%', attrs.place.title)
    body = body.replace('%USERNAME%', `${reportedBy.get('name')} (${reportedBy.get('username')})`)
    body = body.replace('%REASON%', attrs.reason)
    body = body.replace(/\n/g, '<br />');

    const email = {
      body: {
        title: title,
        intro: body,
        signature: false,
      }
    }

    const mailgunHelper = new MailgunHelper({
      apiKey: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN,
      host: process.env.MAILGUN_HOST,
    })

    const mailGenerator = new Mailgen({
      theme: 'default',
      product: {
        name: process.env.APP_NAME,
        link: process.env.MAILGUN_PUBLIC_LINK,
        copyright: __('EMAIL_COPYRIGHT')
      }
    })

    mailgunHelper.send({
      from: process.env.MAILGUN_FROM_ADDRESS,
      to: toAddress,
      subject: subject,
      html: mailGenerator.generate(email),
    })

  }

})