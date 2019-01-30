import express from 'express'
import TopologyDataAPI from './topology-data-api'

const port = process.env.PORT || 3000 // process.env.PORT for Heroku
const topoDataAPI = new TopologyDataAPI(process.env.NODE_ENV)

export default app => {
  app.use(express.json())
  app.set('port', port)
  app.get('/draw/:jsonName', function (req, res) {
    res.type('json')
    res.send(topoDataAPI.convertTopoGraphData(req))
  })
  app.get('/draw-dep-graph/:jsonName', function (req, res) {
    res.type('json')
    res.send(topoDataAPI.convertDependencyGraphData(req))
  })
}
