'use strict'
/**
 * @file Definition of class to visualize force-simulation network diagram.
 */

import { select } from 'd3-selection'
import { json } from 'd3-fetch'
import { interval } from 'd3-timer'
import PositionCache from './position-cache'
import OperationalVisualizer from './operational-visualizer'
import BaseContainer from '~/server/graph/common/base'

/**
 * Force-simulation network diagram visualizer.
 * @extends {BaseContainer}
 */
class GraphVisualizer extends BaseContainer {
  constructor() {
    super()
    /** @type {PositionCache} */
    this.positionCache = new PositionCache()
    /** @type {Array<OperationalVisualizer>} */
    this.graphVisualizers = []
  }

  /**
   * Draw network diagram with topology-data.
   * @param {string} jsonName - File name of topology-data json.
   * @param {AlertRow} alert - Selected alert.
   * @param {function} graphsCallBack - Callback used in frontend.
   *     (to get information about topology data,
   *     see: components.VisualizeDiagramTopology.vue)
   * @public
   */
  drawJsonModel(jsonName, alert, graphsCallBack) {
    json(`/api/graph/topology/${jsonName}`).then(
      graphData => {
        /**
         * Topology data to draw converted from topology json
         * @type {ForceSimulationTopologyData}
         */
        this.graphs = graphData
        /**
         * set auto save fixed node position function
         * @type {string}
         */
        this.storageKey = `netoviz-${jsonName}`
        interval(() => {
          this.positionCache.saveGraphs(this.storageKey, this.graphs)
        }, 5000)
        // hook before draw
        graphsCallBack(graphData)
        // draw
        this._drawGraphs()
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
  _findNodeByPath(path) {
    const nodes = this.flatten(this.graphs.map(graph => graph.nodes))
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
   * Draw diagrams.
   * @private
   */
  _drawGraphs() {
    this._clearAllDiagrams()
    // hand-over the operation through all layers
    // NOTICE: BIND `this`
    const callback = path => this._findNodeByPath(path)
    // entry-point: draw each layer
    for (const graph of this.graphs) {
      // single-diff-view
      const graphVisualizer = new OperationalVisualizer(graph, callback)
      this.positionCache.loadToGraph(this.storageKey, graph, graphVisualizer)
      graphVisualizer.restartSimulation()
      this.graphVisualizers.push(graphVisualizer)
    }
  }

  /**
   * Loop for each visualizer.
   * @param {function} callback - Callback.
   * @private
   */
  _forEachVisualizer(callback) {
    this.graphVisualizers.forEach(callback)
  }

  /**
   * Alias (need to call from UI)
   * @public
   */
  clearAllHighlight() {
    this._clearAllGraphsHighlight()
  }

  /**
   * Clear all highlight.
   * @private
   */
  _clearAllGraphsHighlight() {
    // clear all highlight
    this._forEachVisualizer(vis => vis.clearHighlight())
  }

  /**
   * Clear all warning messages.
   * @private
   */
  _clearAllGraphsWarningMessage() {
    this._forEachVisualizer(vis => vis.clearWarningMessage())
  }

  /**
   * Find a visualizer by its name.
   * @param {string} name - Name of visualizer (network name).
   * @returns {OperationalVisualizer} Found visualizer.
   * @private
   */
  _findGraphVisualizerByName(name) {
    return this.graphVisualizers.find(d => d.graph.name === name)
  }

  /**
   * Highlight node with selected host in alert-table.
   * @param {AlertRow} alert - Selected alert.
   * @public
   */
  highlightByAlert(alert) {
    if (!alert || !this.graphs) {
      return
    }
    this._clearAllGraphsHighlight()
    // find and select (highlight) a node
    //   layer(graph) order is assumed as high -> low
    //   search the node to highlight from low layer
    let targetNode = null
    for (const layer of this.graphs.reverse()) {
      const visualizer = this._findGraphVisualizerByName(layer.name)
      targetNode = visualizer.nodeTypeNodes().find(d => d.name === alert.host)
      if (targetNode) {
        visualizer.highlightNode(targetNode)
        break
      }
    }
    this._clearAllGraphsWarningMessage()
    if (!targetNode) {
      this._forEachVisualizer(vis => {
        const message = `Alerted host: [${alert.host}] is not found.`
        vis.makeWarningMessage(message)
      })
    }
  }
}

export default GraphVisualizer
