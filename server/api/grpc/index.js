import AlertTable from '../common/alert-table'
import GRPCIntegrator from './integrator'
const messages = require('./topology-data_pb')

/** @const {GRPCIntegrator} */
const grpcApi = new GRPCIntegrator('static')

/**
 * Return graph data as GraphReply message.
 *   @see {@link topology-data.proto}
 * @param call
 * @param {function} callback
 * @returns {Promise<void>}
 */
const getGraphData = async (call, callback) => {
  /** @type {proto.netoviz.GraphRequest} */
  const request = call.request
  const jsonName = request.getModelFile()
  const snake2Camel = str =>
    str.toLowerCase().replace(/_./g, s => s.charAt(1).toUpperCase())
  const graphNameNumber2Key = num =>
    Object.keys(messages.GraphName).find(k => messages.GraphName[k] === num)
  const graphNameValue = request.getGraphName()
  const graphName = snake2Camel(graphNameNumber2Key(graphNameValue))
  console.log(`[gRPC] graph: ${jsonName}, ${graphName}(${graphNameValue})`)

  /** @type {proto.netoviz.GraphReply} */
  const reply = new messages.GraphReply()
  reply.setGraphName(graphNameValue)
  reply.setModelFile(jsonName)
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
  console.log(`[gRPC] alerts: ${request.getNumber()}`)

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

/**
 * Return models (model file information) as ModelReply message.
 * @param call
 * @param callback
 * @returns {Promise<void>}
 */
const getModels = async (call, callback) => {
  console.log('[gRPC] models')

  /** @type{proto.netoviz.ModelReply} */
  const reply = new messages.ModelReply()
  const models = await grpcApi.getModels()
  reply.setJson(JSON.stringify(models))
  callback(null, reply)
}

module.exports = { getGraphData, getAlerts, getModels }
