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

const insertToken = (str, token) => {
  return str.replace(/\(\(token\)\)/g, token)
}

const generateToken = () => {
  return tokenValid
  // return uuid.v4()
}

const codeValid = 12345
const codeErrors = {
  99999: 'used',
  88888: 'superseded',
  77777: 'expired'
}

const generateCode = (min = 10000, max = 99999) => {
  return codeValid
  // return Math.floor(Math.random() * (max - min + 1)) + min
}

const insertCode = (str, code) => {
  return str.replace(/\(\(code\)\)/g, code)
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
      'encrypted_email',
      'encrypted_details'
    ],
    response: (body) => {
      const {encrypted_email, encrypted_details, duration} = body
      const token = generateToken(encrypted_email)

      setSaveReturnRecord('setup', 'token', token, {
        encrypted_details
      })

      return {
        token
      }
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
      'encrypted_email',
      'encrypted_details'
    ],
    response: (body) => {
      const {encrypted_email, encrypted_details} = body
      const code = generateCode()

      setSaveReturnRecord('setup', 'code', encrypted_email, {
        code,
        encrypted_details
      })
      return {
        code
      }
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
      'encrypted_email',
      'encrypted_details'
    ],
    response: (body) => {
      const {encrypted_email, encrypted_details} = body
      setSaveReturnRecord('setup', 'record', encrypted_email, {
        encrypted_details
      })
    }
  },
  '/signin/email': {
    requiredProperties: [
      'encrypted_email'
    ],
    response: (body) => {
      const {encrypted_email, duration} = body
      const token = generateToken(encrypted_email)
      setSaveReturnRecord('signin', 'magiclink', token, {
        encrypted_email
      })
      return {
        token
      }
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
      // app.log('encrypted_email', encrypted_email)
      // app.log('saveReturnCache', saveReturnCache)
      return getSaveReturnRecord('setup', 'record', encrypted_email)
    }
  },
  '/signin/mobile': {
    requiredProperties: [
      'sms',
      'encrypted_email'
    ],
    response: (body) => {
      const {sms, encrypted_email} = body
      const code = generateCode()
      sms.body = insertCode(sms.body, code)
      setSaveReturnRecord('signin', 'code', code, {
        encrypted_email
      })
      app.sms(sms)
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
