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
  app.get('/alert/all', (req, res) => {
    console.log('all logs requested')
    db.alert.findAll({}).then((instances) => {
      res.send(instances)
    })
  })
  app.get('/draw/:jsonName', (req, res) => {
    res.type('json')
    res.send(topoDataAPI.convertTopoGraphData(req))
  })
  app.get('/draw-dep-graph/:jsonName', (req, res) => {
    res.type('json')
    res.send(topoDataAPI.convertDependencyGraphData(req))
  })
}
