const app = require('./app')

app.use('*', (req, res) => {
  app.log('route - invalid virus endpoint', req.originalUrl)
  res.status(400).json({
    code: 400,
    name: 'invalid.virus'
  })
})

app.start('User Filestore', 'USER_FILESTORE', 44445)
