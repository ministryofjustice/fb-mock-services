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

app.start('Submitter', 'SUBMITTER', 44446)
