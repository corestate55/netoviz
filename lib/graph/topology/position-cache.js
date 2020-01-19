'use strict'
/**
 * @file Definition of Position-cache for force-simulation visualizer.
 */

import localStorage from 'localStorage'

/**
 * Position cache controller.
 * Load/Save 'fixed' node position in all graphs.
 */
class PositionCache {
  /**
   * @typedef {Object} TopologyPositionCache
   * @prop {Array<NetworkPositionCache>} graphs - Lists of networks.
   */
  /**
   * @typedef {Object} NetworkPositionCache
   * @prop {string} name - Name of network.
   * @prop {Array<NodePositionCache>} nodes - Fixed nodes
   */
  /**
   * @typedef {Object} NodePositionCache
   * @prop {string} path - Path of node.
   * @prop {number} id - ID of node.
   * @prop {number} fx - Fixed-x position.
   * @prop {number} fy - Fixed-y position.
   */
  /**
   * Save position data of each fixed-nodes.
   * @param {string} storageKey - Key of cache (localStorage)
   *     It can identify topology (diagram) name.
   * @param {ForceSimulationTopologyData} graphs - Topology data.
   * @public
   */
  saveGraphs(storageKey, graphs) {
    const positionData = { graphs: [] }
    for (const graph of graphs) {
      const g = {}
      g.name = graph.name
      g.nodes = graph.nodes
        .filter(node => node.fx && node.fy) // filter 'fixed' nodes
        .map(node => {
          const n = {}
          n.path = node.path
          n.id = node.id
          n.fx = node.fx || null
          n.fy = node.fy || null
          return n
        })
      positionData.graphs.push(g)
    }
    const dataStr = JSON.stringify(positionData)
    localStorage.setItem(storageKey, dataStr)
  }

  /**
   * Load position data to nodes.
   * @param {NetworkPositionCache} cachedGraph - Cache for a network.
   * @param {ForceSimulationNetworkData} graph - Topology data to load.
   * @param {OperationalVisualizer} graphVisualizer - Visualizer.
   * @private
   */
  _loadToNode(cachedGraph, graph, graphVisualizer) {
    for (const cachedNode of cachedGraph.nodes) {
      const node = graph.nodes.find(n => n.id === cachedNode.id)
      if (node) {
        node.fx = cachedNode.fx
        node.fy = cachedNode.fy
        graphVisualizer.markNodeWith(node, ['fixed', true])
      }
    }
  }

  /**
   * Load position data to nodes in each network.
   * @param {string} dataString - Saved positions. (json string)
   * @param {ForceSimulationNetworkData} graph - Topology data to load.
   * @param {OperationalVisualizer} graphVisualizer - Visualizer.
   * @private
   */
  _loadToNetwork(dataString, graph, graphVisualizer) {
    /** @type {TopologyPositionCache} */
    const positionData = JSON.parse(dataString)
    const cachedGraph = positionData.graphs.find(cg => cg.name === graph.name)
    if (cachedGraph) {
      this._loadToNode(cachedGraph, graph, graphVisualizer)
    }
  }

  /**
   * Load position data of each fixed-nodes.
   * (NOTICE: use "per graph" to loading data)
   * @param {string} storageKey - Key of cache (localStorage)
   * @param {ForceSimulationNetworkData} graph - Topology data to load.
   * @param {OperationalVisualizer} graphVisualizer - Visualizer.
   */
  loadToGraph(storageKey, graph, graphVisualizer) {
    const dataString = localStorage.getItem(storageKey)
    if (dataString !== null) {
      this._loadToNetwork(dataString, graph, graphVisualizer)
    }
  }
}

export default PositionCache
