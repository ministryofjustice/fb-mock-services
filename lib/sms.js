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

  return async (to, body) => {
    to = to.replace(/^0/, '+44')
      .replace(/\s/g, '')
    //  '+447770372315'
    const options = {
      from: MOBILE,
      to,
      body
    }
    try {
      const message = await client.messages.create(options)
      app.log(`Sent SMS to ${to}: ${message.sid}`)
    } catch (e) {
      app.log(`Failed to send SMS to ${to}`, e)
    }
  }
}

module.exports = init
