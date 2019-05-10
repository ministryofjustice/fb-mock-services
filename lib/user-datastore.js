/* eslint-disable no-throw-literal */
/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
const app = require('./app')
const {
  throwError,
  errorMatch
} = app
const uuid = require('uuid')

let userDataStoreCache = {}
let saveReturnCache = {
  setup: {
    token: {},
    code: {},
    record: {}
  },
  signin: {
    magiclink: {},
    code: {}
  }
}

const setSaveReturnRecord = (phase, type, key, value) => {
  saveReturnCache[phase][type][key] = value
}
const getSaveReturnRecord = (phase, type, key, detailsOnly) => {
  const record = saveReturnCache[phase][type][key]
  if (!record) {
    throwError(`${type}.invalid`, 401)
  }
  if (!detailsOnly) {
    return record
  }
  const {encrypted_details} = record
  return {
    encrypted_details
  }
}

const tokenValid = 'valid'
const tokenErrors = [
  'used',
  'superseded',
  'expired'
]

const codeValid = 12345
const codeErrors = {
  99999: 'used',
  88888: 'superseded',
  77777: 'expired'
}

app.use('/service/:service/user/:userId', async (req, res, next) => {
  const {body, params, method} = req
  const {service, userId} = params
  userDataStoreCache[service] = userDataStoreCache[service] || {}
  const serviceCache = userDataStoreCache[service]

  let message = ''
  if (method === 'GET') {
    message = serviceCache[userId]
    if (!message) {
      return res.status(404).send()
    }
  } else if (method === 'POST') {
    serviceCache[userId] = body
  }
  return res.json(message)
})

const saveReturnBaseUrl = '/service/:service/savereturn'
const saveReturnRoutes = {
  '/email/add': {
    requiredProperties: [
      'email',
      'encrypted_email',
      'encrypted_details',
      'validation_url'
    ],
    response: (body) => {
      const {email, encrypted_details, validation_url, duration} = body
      const token = tokenValid // uuid.v4()
      const link = validation_url.replace(/:token$/, token)
      app.log('token url', link)
      app.mail({
        to: email,
        subject: 'Validate your email address',
        html: `Validate your email: <a href="${link}">${link}</a>`
      })
      setSaveReturnRecord('setup', 'token', token, {
        encrypted_details
      })
    }
  },
  '/email/confirm': {
    requiredProperties: [
      'email_token'
    ],
    response: (body) => {
      const {email_token} = body
      errorMatch(email_token, 'token', tokenErrors)
      return getSaveReturnRecord('setup', 'token', email_token, true)
    }
  },
  '/mobile/add': {
    requiredProperties: [
      'mobile',
      'encrypted_email',
      'encrypted_details'
    ],
    response: (body) => {
      const {mobile, encrypted_email, encrypted_details} = body
      const code = codeValid // Generate 5 digit code
      setSaveReturnRecord('setup', 'code', encrypted_email, {
        code,
        encrypted_details
      })
    }
  },
  '/mobile/confirm': {
    requiredProperties: [
      'code',
      'encrypted_email'
    ],
    response: (body) => {
      const {code, encrypted_email} = body
      errorMatch(code, 'code', codeErrors)
      return getSaveReturnRecord('setup', 'code', encrypted_email, true)
    }
  },
  '/create': {
    requiredProperties: [
      'email',
      'encrypted_email',
      'encrypted_details'
    ],
    response: (body) => {
      const {email, encrypted_email, encrypted_details} = body
      setSaveReturnRecord('setup', 'record', encrypted_email, {
        encrypted_details
      })
      app.mail({
        to: email,
        subject: 'Created a save and return record',
        html: `You can now signin as: ${email}`
      })
    }
  },
  '/signin/email': {
    requiredProperties: [
      'email',
      'encrypted_email',
      'validation_url'
    ],
    response: (body) => {
      const {email, encrypted_email, validation_url, duration} = body
      const magiclink = tokenValid // uuid.v4()
      const link = validation_url.replace(/:magiclink$/, magiclink)
      app.log('magiclink', link)
      setSaveReturnRecord('signin', 'magiclink', magiclink, {
        encrypted_email
      })
      app.mail({
        to: email,
        subject: 'Click to sign in to form',
        html: `Use this url to sign in: <a href="${link}">${link}</a>`
      })
    }
  },
  '/signin/magiclink': {
    requiredProperties: [
      'magiclink'
    ],
    response: (body) => {
      const {magiclink} = body
      errorMatch(magiclink, 'magiclink', tokenErrors)
      app.log('magiclink', magiclink)
      const {encrypted_email} = getSaveReturnRecord('signin', 'magiclink', magiclink)
      app.log('encrypted_email', encrypted_email)
      app.log('saveReturnCache', saveReturnCache)
      return getSaveReturnRecord('setup', 'record', encrypted_email)
    }
  },
  '/signin/mobile': {
    requiredProperties: [
      'mobile',
      'encrypted_email'
    ],
    response: (body) => {
      const {mobile, encrypted_email} = body
      const code = codeValid // Generate 5 digit code
      setSaveReturnRecord('signin', 'code', code, {
        encrypted_email
      })
    }
  },
  '/signin/code/validate': {
    requiredProperties: [
      'code',
      'encrypted_email'
    ],
    response: (body) => {
      const {code} = body
      errorMatch(code, 'code', codeErrors)
      const {encrypted_email} = getSaveReturnRecord('signin', 'code', code)
      // check body.encrypted_email === encrypted_email
      return getSaveReturnRecord('setup', 'record', encrypted_email)
    }
  }

}

app.addRoutes(saveReturnBaseUrl, saveReturnRoutes)

app.start('User Datastore', 'USER_DATASTORE', 44444)
