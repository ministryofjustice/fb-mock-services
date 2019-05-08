const express = require('express')
const bodyParser = require('body-parser')

const app = express()
app.log = (msg) => {
  process.stdout.write(`[${app.mockedName}] ${msg}\n`)
}

// Support for parsing data in POSTs
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false,
  depth: 20,
  allowDots: true,
  parseArrays: false
}))

app.addRoutes = (baseUrl, routes) => {
  Object.keys(routes).forEach(route => {
    app.post(`${baseUrl}${route}`, async (req, res, next) => {
      const props = routes[route]
      Object.keys(props).forEach(prop => {
        if (typeof props[prop] === 'function') {
          req[prop] = props[prop](req, res)
        } else {
          req[prop] = JSON.parse(JSON.stringify(props[prop]))
        }
      })
      next()
    })
  })

  app.post(`${baseUrl}/*`, async (req, res, next) => {
    const {body} = req
    app.log(`${req.originalUrl}
    ${JSON.stringify(body, null, 2)}`)
    const requiredProperties = req.requiredProperties || []
    for (let i = 0; i < requiredProperties.length; i++) {
      const requiredProperty = requiredProperties[i]
      let error
      if (!body[requiredProperty]) {
        error = {
          code: 400,
          name: `missing.property.${requiredProperty}`
        }
      } else if (body[requiredProperty].startsWith('error.')) {
        error = {
          code: 401,
          name: body[requiredProperty].replace(/^error\./, '')
        }
      }
      if (error) {
        return res.status(error.code).json(error)
      }
    }

    res.json(req.success || {})
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
  })
}

module.exports = app
