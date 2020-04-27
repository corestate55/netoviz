/**
 * Definition of gRPC client wrapper.
 */

import { promisify } from 'util'
import messages from '~/server/api/grpc/topology-data_pb'
import services from '~/server/api/grpc/topology-data_grpc_web_pb'

/**
 * gRPC Client wrapper. (Singleton)
 */
class GRPCClient {
  constructor() {
    const host = process.env.NETOVIZ_HOST_ADDR
    const port = process.env.NETOVIZ_GRPC_WEB_PORT
    this.uri = `http://${host}:${port}`
    this.client = new services.TopologyDataClient(this.uri, null, null)
    this._getAlerts = promisify(this.client.getAlerts).bind(this.client)
    this._getGraphData = promisify(this.client.getDiagramData).bind(this.client)
  }

  /**
   * Get alerts.
   * @param {number} alertLimit - Number of alerts to get.
   * @returns {Promise<proto.netoviz.AlertReply>} - Response.
   * @public
   */
  getAlerts(alertLimit) {
    const request = new messages.AlertRequest()
    request.setNumber(alertLimit)
    return this._getAlerts(request, {})
  }

  /**
   * Get graph data.
   * @param {string} graphName - Graph name. (Enum keyword of proto.netoviz.GraphName)
   * @param {string} jsonName - Name of topology file.
   * @param {VisualizerParam} params - Parameters.
   * @returns {Promise<proto.netoviz.GraphReply>} - Response.
   */
  getGraphData(graphName, jsonName, params) {
    const request = new messages.GraphRequest()
    request.setGraphName(messages.GraphName[graphName])
    request.setJsonName(jsonName)
    request.setTarget(params.target)
    request.setLayer(params.layer)
    request.setReverse(params.reverse)
    request.setDepth(params.depth)
    request.setAggregate(params.aggregate)

    return this._getGraphData(request, {})
  }

  /**
   * Alias to GraphName (ENUM table)
   * @param {string} name - Key of GraphName.
   * @returns {proto.netoviz.GraphName} - GraphName value.
   */
  graphName(name) {
    return messages.GraphName[name]
  }
}

const grpcClient = new GRPCClient()
export default grpcClient
