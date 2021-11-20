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
 * @typedef {Object} VisualizerAPIParam
 * @prop {string} use - API type to connect application server.
 * @prop {string} grpcURIBase - gRPC API URI.
 * @prop {string} restURIBase - REST API URI.
 */

import { json } from 'd3-fetch'
import grpcClient from '../../grpc-client'
import DiagramBase from './diagram-base'
import { splitAlertHost } from '@/server/api/common/alert-util'

/**
 * Base class to visualize multiple networks as single diagram.
 * @extends {DiagramBase}
 */
class MultilayerDiagramBase extends DiagramBase {
  /**
   * @param {string} graphName - Graph name.
   * @param {VisualizerAPIParam} apiParam
   */
  constructor(graphName, apiParam) {
    super()

    /**
     * Graph name (Enum keyword: proto.netoviz.GraphName)
     * @type {string}
     */
    this.graphName = graphName
    /** @const {VisualizerAPIParam} */
    this.apiParam = apiParam
  }

  /**
   * Operation to do after draw RFC topology data.
   *   (define its operation to override.)
   * @param {TopologyDiagramParam} params - Parameters.
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
    grpcClient(this.apiParam.grpcURIBase)
      .getGraphData(this.graphName, params)
      .then(
        (response) => {
          const topologyData = JSON.parse(response.getJson())
          this.drawRfcTopologyDataAsDiagram(topologyData, params)
          this.afterDrawRfcTopologyDataHook(params)
        },
        (error) => {
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
    const snake2Camel = (str) =>
      str.toLowerCase().replace(/_./g, (s) => s.charAt(1).toUpperCase())
    json(this.restURI(snake2Camel(this.graphName), params)).then(
      (topologyData) => {
        this.drawRfcTopologyDataAsDiagram(topologyData, params)
        this.afterDrawRfcTopologyDataHook(params)
      },
      (error) => {
        throw error
      }
    )
  }

  /**
   * Draw RFC Topology Data
   * @param {TopologyDiagramParam} params
   * @public
   */
  drawRfcTopologyData(params) {
    if (this.apiParam.use === 'grpc') {
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
    for (const [key, value] of Object.entries(/** @type {Object} */ params)) {
      if (!value || key === 'modelFile') {
        continue
      }
      paramStrings.push(`${key}=${encodeURIComponent(String(value))}`)
    }
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
      this.apiParam.restURIBase + `/api/graph/${graphName}/${params.modelFile}`
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
