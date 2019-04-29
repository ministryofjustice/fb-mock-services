const express = require('express')
const bodyParser = require('body-parser')
const log = require('./log')

const app = express()

const ENV = process.env
let {USER_DATASTORE} = ENV
USER_DATASTORE = USER_DATASTORE || 44444

// Support for parsing data in POSTs
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false,
  depth: 20,
  allowDots: true,
  parseArrays: false
}))

let cache = {}

app.use('/service/:serviceSlug/user/:userId', (req, res, next) => {
  log('route -/service/:serviceSlug/user/:userId', req.originalUrl)
  const {body, params, method} = req
  const {serviceSlug, userId} = params
  cache[serviceSlug] = cache[serviceSlug] || {}
  const serviceCache = cache[serviceSlug]

  let message = ''
  if (method === 'GET') {
    message = serviceCache[userId]
    if (!message) {
      res.status(404)
      res.send()
      return
    }
  } else if (method === 'POST') {
    // console.log(serviceSlug, userId, body)
    serviceCache[userId] = body
  }
  // console.log(serviceSlug, userId, method, 'sending', message)
  res.status(200).json(message)
})

app.listen(USER_DATASTORE, () => {
  log(`Mocked User Datastore running on PORT ${USER_DATASTORE}`)
})
