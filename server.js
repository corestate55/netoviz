const fs = require('fs')
const express = require('express')
const Graphs = require('./src/graph/graphs')

const app = express()
const port = process.env.PORT || 8080 // process.env.PORT for Heroku
const timeStampOf = {}

if (process.env.NODE_ENV !== 'production') {
  console.log('MODE = development')
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
app.get('/draw/:jsonName', function (req, res) {
  const jsonName = req.params.jsonName
  const jsonPath = `dist/model/${jsonName}`
  const cacheJsonPath = `dist/${jsonName}.cache`
  console.log('Requested: ', jsonPath)

  const timeStamp = fs.statSync(jsonPath)
  let resJsonString = '' // stringified json (NOT object)
  if (timeStampOf[jsonPath] && timeStampOf[jsonPath] === timeStamp.mtimeMs) {
    // the json file has not been modified.
    console.log('use cache: ', cacheJsonPath)
    resJsonString = fs.readFileSync(cacheJsonPath, 'utf8')
  } else {
    // the json file was changed.
    timeStampOf[jsonPath] = timeStamp.mtimeMs
    // read data from the json file
    const topoData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
    const graphs = new Graphs(topoData)
    console.log('create cache: ', cacheJsonPath)
    resJsonString = JSON.stringify(graphs.graphs)
    // save cache
    fs.writeFileSync(cacheJsonPath, resJsonString)
  }
  res.type('json')
  res.send(resJsonString)
})

const server = app.listen(app.get('port'), function () {
  const host = server.address().address
  const port = server.address().port
  console.log(`Start app at http://${host}:${port}`)
})
