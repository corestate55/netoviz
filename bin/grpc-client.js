const grpc = require('grpc')

const messages = require('../server/api/grpc/topology-data_pb')
const services = require('../server/api/grpc/topology-data_grpc_pb')

function main() {
  console.log('# start client')
  const args = process.argv.slice(2)
  if (args.length < 2) {
    console.warn('Usage: node grpc-client.js graphType jsonName')
    process.exit(1)
  }
  const graphType = args[0]
  const jsonName = args[1]
  console.log(`# type=${graphType}, json=${jsonName}`)

  const client = new services.TopologyDataClient(
    'localhost:50051',
    grpc.credentials.createInsecure()
  )
  const request = new messages.GraphRequest()
  request.setGraphType(graphType)
  request.setJsonName(jsonName)

  console.log('# send request: ', request.toString())
  client.getDiagramData(request, (error, response) => {
    if (error) {
      console.warn('ERROR : ', error.message())
      return
    }
    console.log('# Receive response:')
    console.log('## Graph type: ', response.getGraphType())
    console.log('## Json name: ', response.getJsonName())
    console.log('## Json data: ', response.getJson())
  })
}

main()
