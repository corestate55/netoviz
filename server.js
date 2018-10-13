const express = require('express')
const app = express()
const port = process.env.PORT || 8080 // process.env.PORT for Heroku
const fs = require('fs')

console.log('ARGV: ', process.argv)
if (process.env.NODE_ENV !== 'production') {
  const webpack = require('webpack')
  const webpackDevMiddleware = require('webpack-dev-middleware')
  const config = require('./webpack.config')
  const compiler = webpack(config(process.env, process.argv))
  app.use(webpackDevMiddleware(compiler))
}

app.set('port', port)
app.use('/', express.static('dist'))
app.get('/', function (req, res) {
  res.redirect(302, '/index.html')
})
app.get('/draw/:fileName', function (req, res) {
  const fileName = req.params.fileName
  console.log('Requested Path: ', fileName)
  const topoData = JSON.parse(fs.readFileSync(`dist/model/${fileName}`, 'utf8'))
  const Graphs = require('./src/graph/graphs')
  const graphs = new Graphs(topoData)
  res.json(graphs.graphs)
})

const server = app.listen(app.get('port'), function () {
  const host = server.address().address
  const port = server.address().port
  console.log(`Start app at http://${host}:${port}`)
})
