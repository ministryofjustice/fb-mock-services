const nodemailer = require('nodemailer')
const MarkdownIt = require('markdown-it')()
const markdown = (str) => {
  return MarkdownIt.render(str)
}

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
    app.log('mail message', options)

    let message = Object.assign({
      from: MAIL
    }, options)
    message = app.personaliseMessage(message)

    if (message.body && !message.text && !message.html) {
      // format it with markdown
      message.html = message.body
    }
    message.html = markdown(message.html)
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
