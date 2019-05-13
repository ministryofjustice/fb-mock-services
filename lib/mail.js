const nodemailer = require('nodemailer')

const {MAIL} = process.env

const init = (app) => {
  if (!MAIL) {
    return async () => {}
  }
  app.log('Using Mail client')

  return async (options) => {
    const transporter = nodemailer.createTransport({
      sendmail: true,
      newline: 'windows',
      logger: false
    })
    const message = Object.assign({
      from: MAIL
    }, options)
    if (!message.text && message.html) {
      message.text = message.html.replace(/<[^>]+>/g, '')
    }
    try {
      const mailInfo = await transporter.sendMail(message)
      app.log(`Sent mail to ${options.to}`, mailInfo.messageId)
    } catch (e) {
      app.log(`Failed to send mail to ${options.to}`, e)
    }
  }
}

module.exports = init
