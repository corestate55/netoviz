import AlertTable from '../common/alert-table'
import GRPCIntegrator from './integrator'
const messages = require('./topology-data_pb')

/**
 * Return graph data as GraphReply message.
 *   @see {@link topology-data.proto}
 * @param call
 * @param {function} callback
 * @returns {Promise<void>}
 */
const getDiagramData = async (call, callback) => {
  /** @type {proto.netoviz.GraphRequest} */
  const request = call.request
  /** @type {proto.netoviz.GraphReply} */
  const reply = new messages.GraphReply()

  const grpcApi = new GRPCIntegrator('static')
  const jsonName = request.getJsonName()
  const snake2Camel = str =>
    str.toLowerCase().replace(/_./g, s => s.charAt(1).toUpperCase())
  const graphNameNumber2Key = num =>
    Object.keys(messages.GraphName).find(k => messages.GraphName[k] === num)
  const graphNameValue = request.getGraphName()
  const graphName = snake2Camel(graphNameNumber2Key(graphNameValue))
  console.log(`gRPC request: ${jsonName}, ${graphName}(${graphNameValue})`)

  reply.setGraphName(graphNameValue)
  reply.setJsonName(jsonName)
  reply.setJson(await grpcApi.getGraphData(graphName, jsonName, request))
  callback(null, reply)
}

/**
 * Return alert data as AlertReply message.
 * @param call
 * @param {function} callback
 * @returns {Promise<void>}
 */
const getAlerts = async (call, callback) => {
  /** @type {proto.netoviz.AlertRequest} */
  const request = call.request
  /** @type {proto.netoviz.AlertReply} */
  const reply = new messages.AlertReply()
  const alertTable = new AlertTable()

  const alerts = await alertTable.alerts(request.getNumber())
  reply.setAlertsList(
    alerts.map(
      d =>
        /** @type {proto.netoviz.Alert} */ new messages.Alert(d.toGRPCArray())
    )
  )
  callback(null, reply)
}

module.exports = { getDiagramData, getAlerts }
