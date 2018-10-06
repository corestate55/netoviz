const express = require('express')
const app = express()
app.set('port', (process.env.PORT || 8080)) // process.env.PORT for Heroku
app.use('/', express.static('dist'))
app.get('*', function (req, res) {
  res.redirect(302, '/index.html')
})

const server = app.listen(app.get('port'), function () {
  const host = server.address().address
  const port = server.address().port
  console.log(`Start app at http://${host}:${port}`)
})
