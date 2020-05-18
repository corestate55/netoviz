/**
 * Definition of gRPC client wrapper.
 */

import { promisify } from 'util'
import messages from '../../server/api/grpc/topology-data_pb'
import services from '../../server/api/grpc/topology-data_grpc_web_pb'

/**
 * gRPC Client wrapper. (Singleton)
 */
class GRPCClient {
  constructor(uri) {
    /** @const{string} */
    this.uri = uri
    console.log('[GRPCClient], grpc-uri:', this.uri)
    /** @const{proto.netoviz.TopologyDataClient} */
    this.client = new services.TopologyDataClient(this.uri, null, null)

    // promisified request functions (private)
    this._getAlerts = promisify(this.client.getAlerts).bind(this.client)
    this._getGraphData = promisify(this.client.getGraphData).bind(this.client)
    this._getModels = promisify(this.client.getModels).bind(this.client)
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
   * @param {TopologyDiagramParam} params - Parameters.
   * @returns {Promise<proto.netoviz.GraphReply>} - Response.
   */
  getGraphData(graphName, params) {
    const request = new messages.GraphRequest()
    request.setGraphName(messages.GraphName[graphName])
    request.setModelFile(params.modelFile)
    request.setAlertHost(params.alertHost)
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

  /**
   * Get model information.
   * @returns {Promise<proto.netoviz.ModelReply>} - Response
   */
  getModels() {
    const request = new messages.ModelRequest()
    return this._getModels(request, {})
  }
}

const clientTable = {}
const grpcClient = uri => {
  if (!clientTable[uri]) {
    clientTable[uri] = new GRPCClient(uri)
  }
  return clientTable[uri]
}

export default grpcClient
