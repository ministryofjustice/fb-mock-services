const app = require('./app')

app.post('/submission', (req, res) => {
  const {body} = req
  app.log(JSON.stringify(body, null, 2))
  const d = new Date()
  const isoString = d.toISOString()
  const status = {
    id: 'UUID',
    created_at: isoString,
    updated_at: isoString,
    status: 'queued'
  }
  res.json(status)
})

app.post('/service/:service/email', (req, res) => {
  const {email} = req.body
  app.mail(email)
  res.json({})
})

app.post('/service/:service/sms', (req, res) => {
  const {sms} = req.body
  app.sms(sms)
  res.json({})
})

app.start('Submitter', 'SUBMITTER', 44446)
