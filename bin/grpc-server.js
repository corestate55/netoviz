require('dotenv').config()
const grpc = require('grpc')
const messages = require('../server/api/grpc/topology-data_pb')
const services = require('../server/api/grpc/topology-data_grpc_pb')

const getGraphData = (call, callback) => {
  const request = call.request
  console.log('# reply to: ', request.toObject())
  const graphNameValue = request.getGraphName()
  const graphNameKey = Object.keys(messages.GraphName).find(
    k => messages.GraphName[k] === graphNameValue
  )
  console.log(`## graph: ${graphNameKey} : ${graphNameValue}`)

  const reply = new messages.GraphReply()
  reply.setGraphName(request.getGraphName())
  reply.setJsonName(request.getJsonName())
  reply.setJson('{ "hoge": "test" }')
  callback(null, reply)
}

const getAlerts = (call, callback) => {
  const request = call.request
  console.log(`Receive ${request.getNumber()}-logs`)
  const reply = new messages.AlertReply()

  const alerts = [
    [10, 'aaa', 'error', '2020-04-20', 'msg1', 'xx', 'jj'],
    [11, 'bbb', 'warning', '2020-04-20', 'msg2', 'xx', 'jj']
  ]
  reply.setAlertsList(alerts.map(d => new messages.Alert(d)))
  callback(null, reply)
}

const getModels = (call, callback) => {
  const reply = new messages.ModelReply()
  const models = [
    {
      file: 'bf_l2s3.json',
      label: '[batfish-L2] sample3'
    },
    {
      file: 'bf_l2s4.json',
      label: '[batfish-L2] sample4'
    }
  ]
  reply.setJson(JSON.stringify(models))
  callback(null, reply)
}

function main() {
  console.log('# start server')
  const server = new grpc.Server()
  const impl = { getGraphData, getAlerts, getModels }
  server.addService(services.TopologyDataService, impl)
  server.bind(
    `${process.env.NETOVIZ_BIND_ADDR}:${process.env.NETOVIZ_GRPC_PORT}`,
    grpc.ServerCredentials.createInsecure()
  )
  server.start()
}

main()
