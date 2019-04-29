const express = require('express')
const bodyParser = require('body-parser')
const log = require('./log')

const app = express()

const ENV = process.env
let {SUBMITTER} = ENV
SUBMITTER = SUBMITTER || 44446

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

app.listen(SUBMITTER, () => {
  log(`Mocked Submitter running on PORT ${SUBMITTER}`)
})
