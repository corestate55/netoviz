import express from 'express'
import TopologyDataAPI from './topology-data-api'
import db from './models'

const port = process.env.PORT || 3000 // process.env.PORT for Heroku
const topoDataAPI = new TopologyDataAPI(process.env.NODE_ENV)

export default app => {
  app.use(express.json())
  app.set('port', port)

  app.post('/alert', (req, res) => {
    const alertData = req.body
    const date = new Date()
    alertData.created_at = date.toISOString()
    alertData.updated_at = date.toISOString()
    db.alert.create(alertData).then((instance) => {
      console.log('create instance: ', instance.dataValues)
    })
    res.send('Log message received.')
  })
  app.get('/alert/:number', async (req, res) => {
    console.log(`requested ${req.params.number} logs`)
    const instances = await db.alert.findAll({
      limit: req.params.number,
      order: [['id', 'DESC']]
    })
    res.send(instances)
  })
  app.get('/alert/all', async (req, res) => {
    console.log('all logs requested')
    const instances = await db.alert.findAll({
      order: [['id', 'DESC']]
    })
    res.send(instances)
  })

  app.get('/graph/topology/:jsonName', async (req, res) => {
    res.type('json')
    res.send(await topoDataAPI.convertTopoGraphData(req))
  })
  app.get('/graph/dependency/:jsonName', async (req, res) => {
    res.type('json')
    res.send(await topoDataAPI.convertDependencyGraphData(req))
  })
  app.get('/graph/nested/:jsonName', async (req, res) => {
    res.type('json')
    res.send(await topoDataAPI.convertNestedGraphData(req))
  })
}
