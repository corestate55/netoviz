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
import { splitAlertHost } from '../../../server/api/common/alert-util'
import DiagramBase from './diagram-base'

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
    grpcClient.getGraphData(this.graphName, params).then(
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
    json(this.restURI(snake2Camel(this.graphName), params)).then(
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
   * Construct REST URI parameter strings
   * @param {TopologyDiagramParam} params
   * @returns {string} Params string.
   * @private
   */
  _constructRestURIParams(params) {
    const paramStrings = []
    // standard param
    for (const [key, value] of Object.entries(/** @type {Object} */ params)) {
      if (!value || ['modelFile', 'alertHost'].includes(key)) {
        continue
      }
      paramStrings.push(`${key}=${encodeURIComponent(String(value))}`)
    }
    // alert info param from alertHost
    const alert = this.splitAlertHost(params.alertHost)
    paramStrings.push(`target=${alert.host}`)
    alert.layer && paramStrings.push(`layer=${alert.layer}`)
    // combine to single string
    return paramStrings.join('&')
  }

  /**
   * Get REST API URI string with parameter string for netoviz API server.
   * @param {string} graphName - Name of graph. (diagram type)
   * @param {TopologyDiagramParam} params
   * @returns {string} URI string.
   * @protected
   */
  restURI(graphName, params) {
    const paramString = this._constructRestURIParams(params)
    const baseUri =
      restURIBase() + `/api/graph/${graphName}/${params.modelFile}`
    const uri = [baseUri, paramString].join('?')
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
