import GRPCIntegrator from './integrator'
const messages = require('./topology-data_pb')

/**
 * Return graph data as GraphReply message.
 *   @see {@link topology-data.proto}
 * @param call
 * @param callback
 * @returns {Promise<void>}
 */
const getDiagramData = async (call, callback) => {
  const request = call.request
  const reply = new messages.GraphReply()
  const grpcApi = new GRPCIntegrator('static')

  reply.setGraphType(request.getGraphType())
  reply.setJsonName(request.getJsonName())
  reply.setJson(await grpcApi.getGraphData(request))
  callback(null, reply)
}

module.exports = getDiagramData
