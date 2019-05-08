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
      'email',
      'encrypted_email',
      'encrypted_details',
      'link_template'
    ]
  },
  '/email/confirm': {
    requiredProperties: [
      'email_token'
    ],
    success: {
      encrypted_details: 'encrypted_details_string'
    }
    // email_details: {
    //   email: 'foo@foo.com',
    //   userId: 'userId',
    //   userToken: 'userToken'
    // }
  },
  '/mobile/add': {
    requiredProperties: [
      'mobile',
      'encrypted_mobile',
      'encrypted_details'
    ]
  },
  '/mobile/confirm': {
    requiredProperties: [
      'code',
      'encrypted_mobile'
    ],
    success: {
      encrypted_details: 'encrypted_details_string'
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
    success: {encrypted_details: 'encrypted_userdetails_string'}
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
