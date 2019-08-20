const twilio = require('twilio')

const {
  ACCOUNTSID,
  AUTHTOKEN,
  MOBILE
} = process.env

const init = (app) => {
  if (!ACCOUNTSID || !AUTHTOKEN || !MOBILE) {
    return async () => {}
  }
  app.log('Using SMS client')

  let client = twilio(ACCOUNTSID, AUTHTOKEN)

  return async (sms) => {
    sms.to = sms.to.replace(/^0/, '+44')
      .replace(/\s/g, '')

    let message = Object.assign({
      from: MOBILE
    }, sms)
    message = app.personaliseMessage(message)

    try {
      const outcome = await client.messages.create(message)
      app.log(`Sent SMS to ${sms.to}: ${outcome.sid}`)
    } catch (e) {
      app.log(`Failed to send SMS to ${sms.to}`, e)
    }
  }
}

module.exports = init
