/* eslint-disable camelcase */
const app = require('./app')
const {responseError} = app
const uuid = require('uuid')

let userDataStoreCache = {}
let saveReturnCache = {
  setup: {
    emailToken: {},
    code: {}
  },
  signin: {
    magiclink: {},
    code: {}
  }
}

const setSaveReturnRecord = (phase, type, key, value) => {
  saveReturnCache[phase][type][key] = value
}
const getSaveReturnRecord = (phase, type, key) => {
  const record = saveReturnCache[phase][type][key]
  if (record) {
    const {encrypted_details} = record
    return {
      encrypted_details
    }
  }
}

app.use('/service/:serviceSlug/user/:userId', async (req, res, next) => {
  app.log('route -/service/:serviceSlug/user/:userId', req.originalUrl)
  const {body, params, method} = req
  const {serviceSlug, userId} = params
  userDataStoreCache[serviceSlug] = userDataStoreCache[serviceSlug] || {}
  const serviceCache = userDataStoreCache[serviceSlug]

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
      'link_template'
    ],
    response: (body) => {
      const {encrypted_details, link_template} = body
      const emailToken = 'valid' // uuid.v4()
      setSaveReturnRecord('setup', 'emailToken', emailToken, {
        encrypted_details
      })
      app.log('emailToken url', link_template.replace(/:token$/, emailToken))
      return {}
    }
  },
  '/email/confirm': {
    requiredProperties: [
      'email_token'
    ],
    response: (body) => {
      const {email_token} = body
      let error
      if (email_token === 'used') {
        error = 'token.used'
      } else if (email_token === 'superseded') {
        error = 'token.superseded'
      } else if (email_token === 'expired') {
        error = 'token.expired'
      }
      if (error) {
        app.log('error', error)
        return responseError(401, error)
      }
      let record = getSaveReturnRecord('setup', 'emailToken', email_token)
      if (!record) {
        return responseError(401, 'token.invalid')
      }
      // app.log('details', JSON.stringify(details))
      return record
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
      const code = 12345 // Generate 5 digit code
      setSaveReturnRecord('setup', 'code', encrypted_email, {
        code,
        encrypted_details
      })
      app.log('mobile code', code)
      return {}
    }
  },
  '/mobile/confirm': {
    requiredProperties: [
      'code',
      'encrypted_email'
    ],
    response: (body) => {
      const {code, encrypted_email} = body
      let error
      if (code === '99999') {
        error = 'code.used'
      } else if (code === '88888') {
        error = 'code.superseded'
      } else if (code === '77777') {
        error = 'code.expired'
      }
      if (error) {
        return responseError(401, error)
      }
      let record = getSaveReturnRecord('setup', 'code', encrypted_email)
      if (!record) {
        return responseError(401, 'code.missing')
      }
      app.log('details', JSON.stringify(record))
      return record
    }
  },
  '/create': {
    requiredProperties: [
      'encrypted_email',
      'encrypted_details'
    ]
  },
  '/signin/email': {
    requiredProperties: [
      'email',
      'encrypted_email'
    ]
  },
  '/signin/magiclink': {
    requiredProperties: [
      'magiclink'
    ],
    response: {encrypted_details: 'encrypted_userdetails_string'}
  },
  '/signin/mobile': {
    requiredProperties: [
      'email',
      'mobile',
      'code'
    ],
    response: {userDetails: 'encrypted_userdetails'}
  }

}

app.addRoutes(saveReturnBaseUrl, saveReturnRoutes)

app.start('User Datastore', 'USER_DATASTORE', 44444)
