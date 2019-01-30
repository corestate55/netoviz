import fs from 'fs'
import express from 'express'
import Graphs from './graph/graphs'
import DepGraphConverter from './data-converter'

const port = process.env.PORT || 3000 // process.env.PORT for Heroku
const timeStampOf = {}
const prodDistDir = 'dist'
const devDistDir = 'public'
const distDir = process.env.NODE_ENV === 'production' ? prodDistDir : devDistDir
const modelDir = `${distDir}/model`

function convertTopoGraphData (req) {
  const jsonName = req.params.jsonName
  const jsonPath = `${modelDir}/${jsonName}`
  const cacheJsonPath = `${prodDistDir}/${jsonName}.cache` // always use prod dist dir
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

export default app => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*') // CORS config
    next()
  })
  app.use(express.json())
  app.set('port', port)
  app.get('/draw/:jsonName', function (req, res) {
    res.type('json')
    res.send(convertTopoGraphData(req))
  })
  app.get('/draw-dep-graph/:jsonName', function (req, res) {
    res.type('json')
    res.send(convertDependencyGraphData(req))
  })
}
