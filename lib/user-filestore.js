const express = require('express')
const bodyParser = require('body-parser')
const log = require('./log')

const app = express()

const ENV = process.env
let {USER_FILESTORE} = ENV
USER_FILESTORE = USER_FILESTORE || 44445

// Support for parsing data in POSTs
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false,
  depth: 20,
  allowDots: true,
  parseArrays: false
}))

app.post('/submission', (req, res) => {
  log('route - submission')
  const {body} = req
  log(JSON.stringify(body, null, 2))
  const d = new Date()
  const isoString = d.toISOString()
  const status = {
    id: 'UUID',
    created_at: isoString,
    updated_at: isoString,
    status: 'queued'
  }
  // console.log({status})
  res.json(status)
})

app.use('*', (req, res) => {
  log('route - invalid virus endpoint', req.originalUrl)
  res.status(400).json({
    code: 400,
    name: 'invalid.virus'
  })
})

app.listen(USER_FILESTORE, () => {
  log(`Mocked User Filestore running on PORT ${USER_FILESTORE}`)
})
