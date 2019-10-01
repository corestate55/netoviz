import TopologyDataAPI from './graph-api/topology-data-api'
import db from './models'

const express = require('express')
const apiRouter = express.Router()

const topoDataAPI = new TopologyDataAPI(
  process.env.NODE_ENV,
  'static',
  'static'
)
apiRouter.use(express.json())

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

apiRouter.get('/alert/:number', async (req, res) => {
  console.log(`requested ${req.params.number} logs`)
  const instances = await db.alert.findAll({
    limit: req.params.number,
    order: [['id', 'DESC']]
  })
  res.send(instances)
})

apiRouter.get('/alert/all', async (req, res) => {
  console.log('all logs requested')
  const instances = await db.alert.findAll({
    order: [['id', 'DESC']]
  })
  res.send(instances)
})

apiRouter.get('/models', async (req, res) => {
  console.log('model list requested')
  res.type('json')
  res.send(await topoDataAPI.getModels())
})

apiRouter.post('/graph/:graphName/:jsonName', (req, res) => {
  topoDataAPI.postGraphData(req)
  res.send(JSON.stringify({ message: 'layout data received.' }))
})

apiRouter.get('/graph/:graphName/:jsonName', async (req, res) => {
  res.type('json')
  res.send(await topoDataAPI.getGraphData(req))
})

module.exports = apiRouter
