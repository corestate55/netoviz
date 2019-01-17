const fs = require('fs')
const express = require('express')
const Graphs = require('./src/graph/graphs')
const DepGraphConverter = require('./src/dependency-visualizer/depgraph_conv')

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

function convertTopoGraphData (req) {
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
  return resJsonString
}

function convertDependencyGraphData (req) {
  const topoJsonString = convertTopoGraphData(req)
  const depGraph = new DepGraphConverter(JSON.parse(topoJsonString))
  return JSON.stringify(depGraph.toData())
}

app.set('port', port)
app.use('/', express.static('dist'))
app.get('/', function (req, res) {
  res.redirect(302, '/index.html')
})
app.get('/draw/:jsonName', function (req, res) {
  res.type('json')
  res.send(convertTopoGraphData(req))
})
app.get('/draw-dep-graph/:jsonName', function (req, res) {
  res.type('json')
  res.send(convertDependencyGraphData(req))
})

const server = app.listen(app.get('port'), function () {
  const host = server.address().address
  const port = server.address().port
  console.log(`Start app at http://${host}:${port}`)
})
