/**
 * @file Definition of base class to visualize single networks.
 */

/**
 * Alert row : selected row in AlertTable.
 * @typedef {
 *    {layer: string, host: string, tp: string} |
 *    {host: string}
 * } AlertRow
 */
/**
 * All topology data.
 * @typedef {
 *   DependencyTopologyData |
 *   DistanceTopologyData |
 *   NestedTopologyData
 * } AllTopologyData
 */

import { json } from 'd3-fetch'
import grpcClient from '../../grpc-client'
import { restURIBase } from '../../uri'
import DiagramBase from './diagram-base'
import { splitAlertHost } from './util'

/**
 * Base class to visualize multiple networks as single diagram.
 * @extends {DiagramBase}
 */
class MultilayerDiagramBase extends DiagramBase {
  constructor(graphName) {
    super()

    /**
     * Graph name (Enum keyword: proto.netoviz.GraphName)
     * @type {string}
     */
    this.graphName = graphName
  }

  /**
   * Operation to do after draw RFC topology data.
   *   (define its operation to override.)
   * @param {VisualizerParam} params - Parameters.
   * @protected
   */
  afterDrawRfcTopologyDataHook(params) {
    // nothing to do as default
  }

  /**
   * Get graph data with gRPC API and draw it.
   * @params {TopologyDiagramParam} params
   * @protected
   */
  getGraphDataViaGRPC(params) {
    const alert = this.splitAlertHost(params.alertHost)
    params.target = alert.host
    params.layer = alert.layer
    grpcClient.getGraphData(this.graphName, params.modelFile, params).then(
      response => {
        const topologyData = JSON.parse(response.getJson())
        this.drawRfcTopologyDataAsDiagram(topologyData, params)
        this.afterDrawRfcTopologyDataHook(params)
      },
      error => {
        throw error
      }
    )
  }

  /**
   * Get graph data with REST API and draw it.
   * @params {TopologyDiagramParam} params
   * @protected
   */
  getGraphDataViaREST(params) {
    const snake2Camel = str =>
      str.toLowerCase().replace(/_./g, s => s.charAt(1).toUpperCase())
    const alert = this.splitAlertHost(params.alertHost)
    params.target = alert.host
    params.layer = alert.layer
    json(
      this.restURI(snake2Camel(this.graphName), params.modelFile, params)
    ).then(
      topologyData => {
        this.drawRfcTopologyDataAsDiagram(topologyData, params)
        this.afterDrawRfcTopologyDataHook(params)
      },
      error => {
        throw error
      }
    )
  }

  /**
   * @typedef {Object} TopologyDiagramParam
   * @prop {string} modelFile - File name of topology-data (.json).
   * @prop {string} alertHost - Host(TP) path to highlight.
   * @prop {string} [layer] - alias: alertHost (alertHost.layer)
   * @prop {string} [target] - alias: alertHost (alertHost.host, for gRPC query)
   * @prop {boolean} [reverse] - Viewpoint flag (for nested diagram)
   * @prop {number} [depth] - Nest depth (for nested diagram)
   * @prop {boolean} [aggregate] - Node aggregate flag (for nested diagram)
   * @prop {boolean} [fitGrid] - Grid fitting flag (for nested diagram)
   */
  /**
   * Draw RFC Topology Data
   * @param {TopologyDiagramParam} params
   * @public
   */
  drawRfcTopologyData(params) {
    if (process.env.NODE_ENV === 'development') {
      this.getGraphDataViaGRPC(params)
    } else {
      this.getGraphDataViaREST(params)
    }
  }

  /**
   * Make all svg elements of network diagram.
   * @param {AllTopologyData} topologyData - Topology data.
   * @abstract
   * @public
   */
  makeAllDiagramElements(topologyData) {
    // to be override
  }

  /**
   * Set event handlers to svg elements.
   * @abstract
   * @protected
   */
  setAllDiagramElementsHandler() {
    // to be override
  }

  /**
   * Draw topology data as diagram.
   * @param {AllTopologyData} topologyData - Topology data.
   * @param {TopologyDiagramParam} params
   * @protected
   */
  drawRfcTopologyDataAsDiagram(topologyData, params) {
    this.clearDiagramContainer()
    this.makeAllDiagramElements(topologyData)
    this.setAllDiagramElementsHandler()
    this.highlightByAlert(params.alertHost)
  }

  /**
   * Get REST API URI string with parameter string for netoviz API server.
   * @param {string} graphName - Name of graph. (diagram type)
   * @param {string} jsonName - Name of topology file.
   * @param {VisualizerParam} params - Parameter key-value dictionary.
   * @returns {string} URI string.
   * @protected
   */
  restURI(graphName, jsonName, params) {
    const paramStrings = []
    for (const [key, value] of Object.entries(/** @type {Object} */ params)) {
      if (!value) {
        continue
      }
      paramStrings.push(`${key}=${encodeURIComponent(String(value))}`)
    }
    const baseUri = `${restURIBase()}/api/graph/${graphName}/${jsonName}`
    const uri = [baseUri, paramStrings.join('&')].join('?')
    console.log('Query URI :', uri)
    return uri
  }

  // delegate
  splitAlertHost(alertHost) {
    return splitAlertHost(alertHost)
  }

  /**
   * Highlight node with selected host in alert-table.
   * @param {string} alertHost - Target host name
   *   : 'layer__host__tp' or 'layer__host' or 'host' format.
   * @public
   */
  highlightByAlert(alertHost) {
    // to be override
  }
}

export default MultilayerDiagramBase
