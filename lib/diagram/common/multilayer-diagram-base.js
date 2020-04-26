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
 * Visualizer parameters.
 * @typedef {Object} VisualizerParam
 * @prop {string} [target] - Target node/tp name to highlight. (see AlertRow.host)
 * @prop {boolean} [reverse] - Flag for top/bottom view selection.
 * @prop {number} [depth] - Maximum layer depth to display.
 * @prop {string} [layer] - Layer name of selected node to highlight.
 *     (used-in click-hook, to drill-down by click)
 * @prop {boolean} [fitGrid] - Flag for enable/disable grid-fitting.
 * @prop {boolean} [aggregate] - Flag for enable/disable node aggregation.
 */

import { json } from 'd3-fetch'
import grpcClient from '../../grpc-client'
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
    this.grpcGraphName = graphName
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
   * Get diagram data with gRPC API and draw it.
   * @param {string} jsonName - Name of topology file.
   * @param {AlertRow} alert - Selected alert.
   * @param {VisualizerParam} params - Parameters.
   * @protected
   */
  getDiagramDataViaGRPC(jsonName, alert, params) {
    params.target = this.targetNameFromAlert(alert)
    grpcClient.getGraphData(this.grpcGraphName, jsonName, params).then(
      response => {
        const topologyData = JSON.parse(response.getJson())
        this.drawRfcTopologyDataAsDiagram(topologyData, alert)
        this.afterDrawRfcTopologyDataHook(params)
      },
      error => {
        throw error
      }
    )
  }

  /**
   * Get diagram data with REST API and draw it.
   * @param {string} jsonName - Name of topology file.
   * @param {AlertRow} alert - Selected alert.
   * @param {VisualizerParam} params - Parameters.
   * @protected
   */
  getDiagramDataViaREST(jsonName, alert, params) {
    params.target = this.targetNameFromAlert(alert)
    json(this.restURI('nested', jsonName, params)).then(
      topologyData => {
        this.drawRfcTopologyDataAsDiagram(topologyData, alert)
        this.afterDrawRfcTopologyDataHook(params)
      },
      error => {
        throw error
      }
    )
  }

  /**
   * Draw topology json data as SVG diagram.
   * @param {string} jsonName - Name of topology file.
   * @param {AlertRow} alert - Selected alert.
   * @param {VisualizerParam} [params] - Parameters.
   * @public
   */
  drawRfcTopologyData(jsonName, alert, params = {}) {
    if (process.env.NODE_ENV === 'development') {
      this.getDiagramDataViaGRPC(jsonName, alert, params)
    } else {
      this.getDiagramDataViaREST(jsonName, alert, params)
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
   * Highlight node with selected host in alert-table.
   * @param {AlertRow} alert - Selected alert.
   * @abstract
   * @public
   */
  highlightByAlert(alert) {
    // to be override
  }

  /**
   * Draw topology data as diagram.
   * @param {AllTopologyData} topologyData - Topology data.
   * @param {AlertRow} alert - Selected alert.
   * @protected
   */
  drawRfcTopologyDataAsDiagram(topologyData, alert) {
    this.clearDiagramContainer()
    this.makeAllDiagramElements(topologyData)
    this.setAllDiagramElementsHandler()
    this.highlightByAlert(alert)
  }

  /**
   * Get Target name from alert.
   * @param {AlertRow} alert - Alert data.
   * @returns {string} Name of target to highlight.
   * @protected
   */
  targetNameFromAlert(alert) {
    return alert?.host || ''
  }

  /**
   * Get gRPC API URI wtring.
   * @returns {string}
   * @protected
   */
  grpcURI() {
    const host = window.location.hostname
    const port = process.env.NETOVIZ_GRPC_WEB_PORT
    return `http://${host}:${port}`
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
    const baseUri = `/api/graph/${graphName}/${jsonName}`
    const uri = [baseUri, paramStrings.join('&')].join('?')
    console.log('Query URI :', uri)
    return uri
  }
}

export default MultilayerDiagramBase
