/* eslint-disable no-throw-literal */
if (process.env.MOCKENV) {
  require('dotenv').config()
}

const express = require('express')
const bodyParser = require('body-parser')

const app = express()

const log = (msg, ...msgs) => {
  const altMsg = msgs.map(msg => JSON.stringify(msg, null, 2)).join(' ')
  process.stdout.write(`[${app.mockedName}] ${msg} ${altMsg}\n`)
}
app.log = log

const throwError = (name, code = 400) => {
  throw {
    code,
    name
  }
}
app.throwError = throwError

const errorMatch = (value, type, matches) => {
  let matchObject = {}
  if (Array.isArray(matches)) {
    matches.forEach(match => {
      matchObject[match] = match
    })
  } else {
    matchObject = matches
  }
  if (matchObject[value]) {
    throwError(`${type}.${matchObject[value]}`, 401)
  }
}
app.errorMatch = errorMatch

const personaliseMessage = (message) => {
  if (message.body) {
    if (message.extra_personalisation) {
      Object.keys(message.extra_personalisation).forEach(key => {
        const keyRegex = new RegExp(`\\(\\(${key}\\)\\)`, 'g')
        message.body = message.body.replace(keyRegex, message.extra_personalisation[key])
      })
    }
  }
  return message
}
app.personaliseMessage = personaliseMessage

// Support for parsing data in POSTs
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false,
  depth: 20,
  allowDots: true,
  parseArrays: false
}))

app.use((req, res, next) => {
  log(req.method, req.originalUrl)
  next()
})

app.addRoutes = (baseUrl, routes) => {
  Object.keys(routes).forEach(route => {
    app.post(`${baseUrl}${route}`, async (req, res) => {
      try {
        const props = routes[route]
        const {body} = req
        app.log('body', body)
        const requiredProperties = props.requiredProperties || []
        for (let i = 0; i < requiredProperties.length; i++) {
          const requiredProperty = requiredProperties[i]
          const bodyProperty = body[requiredProperty]
          if (!bodyProperty) {
            const name = `missing.property.${requiredProperty}`
            throwError(name, 400)
          } else if (typeof bodyProperty === 'string' && bodyProperty.startsWith('error.')) {
            const name = bodyProperty.replace(/^error\./, '')
            throwError(name, 400)
          }
        }
        let response
        if (props.response) {
          if (typeof props.response === 'function') {
            response = props.response(req.body, req, res)
          } else {
            response = props.response
          }
        }
        response = response || {}
        app.log('response', response)
        res.json(response)
      } catch (error) {
        app.log('error', error)
        res.status(error.code).json(error)
      }
    })
  })
}

app.start = (name, portVar, portDefault) => {
  app.mockedName = name
  // unhandled routes must be 404s
  app.use('*', (req, res) => {
    res.status(404).json({code: 404, name: 'notfound'})
  })

  const PORT = process.env[portVar] || portDefault

  app.listen(PORT, () => {
    app.log(`Mocked ${name} running on PORT ${PORT}`)
    app.mail = require('./mail')(app)
    app.sms = require('./sms')(app)
  })
}

module.exports = app
