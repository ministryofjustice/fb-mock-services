const app = require('./app')

let userDataStoreCache = {}

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
      'email_for_sending',
      'email',
      'email_details',
      'link_template'
    ],
    success: {success: 'email_added'}
  },
  '/email/confirm': {
    requiredProperties: [
      'email_token'
    ],
    success: {
      email_details: 'encrypted_details'
    }
    // email_details: {
    //   email: 'foo@foo.com',
    //   userId: 'userId',
    //   userToken: 'userToken'
    // }
  },
  '/mobile/add': {
    requiredProperties: [
      'mobile_for_sending',
      'mobile',
      '2fa_details'
    ],
    success: {success: 'mobile_added'}
  },
  '/mobile/confirm': {
    requiredProperties: [
      'code',
      'mobile'
    ],
    success: {
      '2fa_details': 'encrypted_details'
    }
  },
  '/create': {
    requiredProperties: [
      'email',
      'userDetails'
    ],
    success: {
      email_details: 'encrypted_details'
    }
  },
  '/signin/email': {
    requiredProperties: [
      'email',
      'email_for_sending'
    ],
    success: {success: 'magiclink_sent'}
  },
  '/signin/magiclink': {
    requiredProperties: [
      'magiclink'
    ],
    success: {userDetails: 'encrypted_userdetails'}
  },
  '/signin/mobile': {
    requiredProperties: [
      'email',
      'mobile',
      'code'
    ],
    success: {userDetails: 'encrypted_userdetails'}
  }

}

app.addRoutes(saveReturnBaseUrl, saveReturnRoutes)

app.start('User Datastore', 'USER_DATASTORE', 44444)
