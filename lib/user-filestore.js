const app = require('./app')

const success = false
app.use('*', (req, res) => {
  app.log('route - invalid virus endpoint', req.originalUrl)
  if (success) {
    return res.send({
      success: true,
      fingerprint: 232323213
    })
  } else {
    res.status(400).json({
      code: 749,
      name: 'mcwibble'
    })
  }
})

app.start('User Filestore', 'USER_FILESTORE', 44445)
