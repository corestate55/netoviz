'use strict'
/**
 * @file Definition of class to visualize force-simulation network diagram.
 */

import { select } from 'd3-selection'
import { json } from 'd3-fetch'
import { interval } from 'd3-timer'
import PositionCache from './position-cache'
import ForceSimulationDiagramOperator from './operator'
import BaseContainer from '~/server/graph/common/base'

/**
 * Force-simulation network diagram visualizer.
 * @extends {BaseContainer}
 */
class ForceSimulationDiagramVisualizer extends BaseContainer {
  constructor() {
    super()
    /** @type {PositionCache} */
    this.positionCache = new PositionCache()
    /** @type {Array<ForceSimulationDiagramOperator>} */
    this.diagramOperators = []
  }

  /**
   * Draw network diagram with topology-data.
   * @param {string} jsonName - File name of topology-data json.
   * @param {AlertRow} alert - Selected alert.
   * @param {ForceSimulationDiagramVisualizer-drawHookCallback} drawHookCallback - Callback
   *     used in frontend to get information about topology data,
   *     (see: components/VisualizeDiagramForceSimulation.vue)
   * @public
   */
  drawRfcTopologyData(jsonName, alert, drawHookCallback) {
    json(`/api/graph/forceSimulation/${jsonName}`).then(
      topologyData => {
        /**
         * Topology data to draw converted from topology json
         * @type {ForceSimulationTopologyData}
         */
        this.topologyData = topologyData
        /**
         * set auto save fixed node position function
         * @type {string}
         */
        this.storageKey = `netoviz-${jsonName}`
        interval(() => {
          this.positionCache.saveTopology(this.storageKey, this.topologyData)
        }, 5000)
        /**
         * Hook before draw force-simulation diagram.
         * @callback ForceSimulationDiagramVisualizer-drawHookCallback
         * @param {ForceSimulationTopologyData} topologyData - Topology data.
         */
        drawHookCallback(this.topologyData)
        // draw
        this._drawNetworkDiagrams()
        this.highlightByAlert(alert)
      },
      error => {
        throw error
      }
    )
  }

  /**
   * Find node (from whole networks) by path. (for callback for each network)
   * @param {string} path - Path of node.
   * @returns {ForceSimulationNodeData} Found node.
   * @private
   */
  _findNodeDataByPath(path) {
    const nodes = this.flatten(this.topologyData.map(network => network.nodes))
    return nodes.find(d => d.path === path)
  }

  /**
   * Clear (remove) all diagrams.
   * @private
   */
  _clearAllDiagrams() {
    select('div#visualizer')
      .selectAll('div.network-layer')
      .remove()
  }

  /**
   * Draw diagrams of each network.
   * @private
   */
  _drawNetworkDiagrams() {
    this._clearAllDiagrams()
    // hand-over the operation through all layers
    // NOTICE: BIND `this`
    const callback = path => this._findNodeDataByPath(path)
    // entry-point: draw each layer
    for (const networkData of this.topologyData) {
      /** @type {ForceSimulationDiagramOperator} */
      const networkDiagram = new ForceSimulationDiagramOperator(
        networkData,
        callback
      )
      this.positionCache.loadToTopologyData(
        this.storageKey,
        networkData,
        networkDiagram
      )
      networkDiagram.restartSimulation()
      this.diagramOperators.push(networkDiagram)
    }
  }

  /**
   * Exec callback for each diagram operator. (correspond with each network in topology)
   * @param {ForceSimulationDiagramVisualizer-forEachVisualizerCallback} callback - Callback.
   * @private
   */
  _forEachDiagramOperator(callback) {
    /**
     * @callback ForceSimulationDiagramVisualizer-forEachVisualizerCallback
     * @param {ForceSimulationDiagramOperator} diagramOperator - Diagram operator of each network.
     */
    this.diagramOperators.forEach(callback)
  }

  /**
   * Alias (need to call from UI)
   * @public
   */
  clearAllHighlight() {
    this._clearAllDiagramsHighlight()
  }

  /**
   * Clear all highlight.
   * @private
   */
  _clearAllDiagramsHighlight() {
    // clear all highlight
    this._forEachDiagramOperator(operator => operator.clearHighlight())
  }

  /**
   * Clear all warning messages.
   * @private
   */
  _clearAllDiagramsWarningMessage() {
    this._forEachDiagramOperator(operator => operator.clearWarningMessage())
  }

  /**
   * Find a visualizer by its name.
   * @param {string} name - Name of visualizer (network name).
   * @returns {ForceSimulationDiagramOperator} Found visualizer.
   * @private
   */
  _findDiagramOperatorByName(name) {
    return this.diagramOperators.find(d => d.networkData.name === name)
  }

  /**
   * Highlight node with selected host in alert-table.
   * @param {AlertRow} alert - Selected alert.
   * @public
   */
  highlightByAlert(alert) {
    if (!alert || !this.topologyData) {
      return
    }
    this._clearAllDiagramsHighlight()
    // find and select (highlight) a node
    //   network(layer) order is assumed as high -> low
    //   search the node to highlight from low layer
    let targetNode = null
    for (const networkData of this.topologyData.reverse()) {
      const visualizer = this._findDiagramOperatorByName(networkData.name)
      targetNode = visualizer.nodeTypeNodes().find(d => d.name === alert.host)
      if (targetNode) {
        visualizer.highlightNode(targetNode)
        break
      }
    }
    this._clearAllDiagramsWarningMessage()
    if (!targetNode) {
      this._forEachDiagramOperator(operator => {
        const message = `Alerted host: [${alert.host}] is not found.`
        operator.makeWarningMessage(message)
      })
    }
  }
}

export default ForceSimulationDiagramVisualizer
