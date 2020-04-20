const grpc = require('grpc')

const messages = require('../server/api/grpc/topology-data_pb')
const services = require('../server/api/grpc/topology-data_grpc_pb')

const client = new services.TopologyDataClient(
  'localhost:50051',
  grpc.credentials.createInsecure()
)

function printGraphDataTestUsage() {
  console.warn('Usage: node grpc-client.js graph graphType jsonName')
}

function printAlertsTestUsage() {
  console.warn('Usage: node grpc-client.js alerts number')
}

function getGraphData() {
  console.log('# start client to get graph data')
  const args = process.argv.slice(3)
  if (args.length < 2) {
    printGraphDataTestUsage()
    process.exit(1)
  }
  const graphType = args[0]
  const jsonName = args[1]
  console.log(`# type=${graphType}, json=${jsonName}`)

  const request = new messages.GraphRequest()
  request.setGraphType(graphType)
  request.setJsonName(jsonName)

  console.log('# send request: ', request.toString())
  client.getDiagramData(request, (error, response) => {
    if (error) {
      console.warn('ERROR : ', error.message())
      process.exit(1)
    }
    console.log('# Receive response:')
    console.log('## Graph type: ', response.getGraphType())
    console.log('## Json name: ', response.getJsonName())
    console.log('## Json data: ', response.getJson())
  })
}

function getAlerts() {
  console.log('# start client to get alerts')
  const args = process.argv.slice(3)
  if (args.length < 1) {
    printGraphDataTestUsage()
    process.exit(1)
  }
  const request = new messages.AlertRequest()
  request.setNumber(Number(args[0]))

  console.log('# send request: ', request.toString())
  client.getAlerts(request, (error, response) => {
    if (error) {
      console.warn('ERROR : ', error.message())
      process.exit(1)
    }
    console.log('# Receive response:')
    response.getAlertsList().forEach(d => {
      // const str = [
      //   `i=${d.getId()}`,
      //   `h=${d.getHost()}`,
      //   `s=${d.getSeverity()}`,
      //   `d=${d.getDate()}`,
      //   `m=${d.getMessage()}`,
      //   `c=${d.getCreatedAt()}`,
      //   `u=${d.getUpdatedAt()}`
      // ].join(', ')
      console.log(d.toObject())
    })
  })
}

if (process.argv.slice(2).length < 1) {
  printGraphDataTestUsage()
  printAlertsTestUsage()
  process.exit(1)
}
if (process.argv[2] === 'graph') {
  getGraphData()
} else {
  getAlerts()
}
