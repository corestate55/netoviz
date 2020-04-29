/**
 * @file API definition of netoviz HTTP server.
 */

import AlertTable from '../common/alert-table'
import RESTIntegrator from './integrator'

const express = require('express')
/**
 * Routing API class of Express server.
 * ({@link http://expressjs.com/en/guide/routing.html})
 * @typedef {Object} Router
 * @prop {function} use
 * @prop {function} post
 * @prop {function} get
 */
/** @type {Router} */
const apiRouter = express.Router()

/** @type {AlertTable} */
const alertTable = new AlertTable()

/**
 * API class instance of topology graph.
 * It converts RFC8345 data (from json) for topology data.
 * Other graph read it and convert for each graph.
 * @type{RESTIntegrator}
 */
const restApi = new RESTIntegrator('static')
apiRouter.use(express.json())

// API to receive alert log data.
apiRouter.post('/alert', (req, res) => {
  const alertData = req.body
  alertTable.addAlert(alertData)
  res.send('Log message received.')
})

// API to send several alert log data.
apiRouter.get('/alert/:number', async (req, res) => {
  console.log(`requested ${req.params.number} logs`)
  res.send(await alertTable.alerts(req.params.number))
})

// API to send ALL alert log data
apiRouter.get('/alert/all', async (req, res) => {
  console.log('[REST] alerts: all')
  res.send(await alertTable.allAlerts())
})

// API to send all model-file data.
apiRouter.get('/models', async (req, res) => {
  console.log('[REST] models')
  res.type('json')
  res.send(await restApi.getModels())
})

// API to receive graph-layout data. (in nested graph)
apiRouter.post('/graph/:graphName/:jsonName', (req, res) => {
  console.log('[REST] post graph layout')
  restApi.postGraphData(req)
  res.send(JSON.stringify({ message: 'layout data received.' }))
})

// API to send converted graph data. (for web frontend)
apiRouter.get('/graph/:graphName/:jsonName', async (req, res) => {
  console.log('[REST] graph')
  res.type('json')
  const p = req.params // alias
  res.send(await restApi.getGraphData(p.graphName, p.jsonName, req))
})

module.exports = apiRouter
