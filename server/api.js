/**
 * @file API definition of netoviz HTTP server.
 */

import TopologyDataAPI from './graph-api/topology-data-api'
import db from './models'

const express = require('express')
const apiRouter = express.Router()

/**
 * API class instance of topology graph.
 * It converts RFC8345 data (from json) for topology-graph data.
 * Other graph read it and convert for each graph.
 * @type{TopologyDataAPI}
 */
const topoDataAPI = new TopologyDataAPI('static')
apiRouter.use(express.json())

/**
 * API to receive alert log data.
 */
apiRouter.post('/alert', (req, res) => {
  const alertData = req.body
  const date = new Date()
  alertData.created_at = date.toISOString()
  alertData.updated_at = date.toISOString()
  db.alert.create(alertData).then(instance => {
    console.log('create instance: ', instance.dataValues)
  })
  res.send('Log message received.')
})

/**
 * API to send several alert log data.
 */
apiRouter.get('/alert/:number', async (req, res) => {
  console.log(`requested ${req.params.number} logs`)
  const instances = await db.alert.findAll({
    limit: req.params.number,
    order: [['id', 'DESC']]
  })
  res.send(instances)
})

/**
 * API to send ALL alert log data
 */
apiRouter.get('/alert/all', async (req, res) => {
  console.log('all logs requested')
  const instances = await db.alert.findAll({
    order: [['id', 'DESC']]
  })
  res.send(instances)
})

/**
 * API to send all model-file data.
 */
apiRouter.get('/models', async (req, res) => {
  console.log('model list requested')
  res.type('json')
  res.send(await topoDataAPI.getModels())
})

/**
 * API to receive graph-layout data. (in nested graph)
 */
apiRouter.post('/graph/:graphName/:jsonName', (req, res) => {
  topoDataAPI.postGraphData(req)
  res.send(JSON.stringify({ message: 'layout data received.' }))
})

/**
 * API to send converted graph data. (for web frontend)
 */
apiRouter.get('/graph/:graphName/:jsonName', async (req, res) => {
  res.type('json')
  res.send(await topoDataAPI.getGraphData(req))
})

module.exports = apiRouter
