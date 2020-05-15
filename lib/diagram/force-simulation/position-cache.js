/**
 * @file Definition of Position-cache for force-simulation visualizer.
 */

import localStorage from 'localStorage'

/**
 * Position cache controller.
 * Load/Save 'fixed' node position in topology.
 */
class PositionCache {
  /**
   * @typedef {Object} TopologyPositionCache
   * @prop {Array<NetworkPositionCache>} networks - Lists of networks.
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
   * @prop {number|null} fx - Fixed-x position.
   * @prop {number|null} fy - Fixed-y position.
   */

  /**
   * Save position data of each fixed-nodes.
   * @param {string} storageKey - Key of cache (localStorage)
   *     It can identify topology (diagram) name.
   * @param {ForceSimulationTopologyData} topologyData - Topology data.
   * @public
   */
  saveTopology(storageKey, topologyData) {
    const positionData = { networks: [] }
    for (const networkData of topologyData) {
      /** @type {NetworkPositionCache} */
      const fixedNodesInNetwork = {}
      fixedNodesInNetwork.name = networkData.name
      fixedNodesInNetwork.nodes = networkData.nodes
        .filter(node => node.fx && node.fy) // filter 'fixed' nodes
        .map(
          node =>
            /** @type {NodePositionCache} */ ({
              path: node.path,
              id: node.id,
              fx: node.fx || null,
              fy: node.fy || null
            })
        )
      positionData.networks.push(fixedNodesInNetwork)
    }
    const dataStr = JSON.stringify(positionData)
    localStorage.setItem(storageKey, dataStr)
  }

  /**
   * Load position data to nodes.
   * @param {NetworkPositionCache} cachedNetworkData - Cache for a network.
   * @param {ForceSimulationNetworkData} networkData - Network data to load.
   * @param {ForceSimulationDiagramOperator} diagramOperator - Visualizer.
   * @private
   */
  _loadToNodeData(cachedNetworkData, networkData, diagramOperator) {
    for (const cachedNode of cachedNetworkData.nodes) {
      const nodeData = networkData.nodes.find(n => n.id === cachedNode.id)
      if (nodeData) {
        nodeData.fx = cachedNode.fx
        nodeData.fy = cachedNode.fy
        diagramOperator.markNodeWith(nodeData, ['fixed', true])
      }
    }
  }

  /**
   * Load position data to nodes in each network.
   * @param {TopologyPositionCache} storedData - Saved positions. (data)
   * @param {ForceSimulationNetworkData} networkData - Network data to load.
   * @param {ForceSimulationDiagramOperator} diagramOperator - Visualizer.
   * @private
   */
  _loadToNetwork(storedData, networkData, diagramOperator) {
    if (!storedData.networks) {
      return
    }
    const cachedNetworkData = storedData.networks.find(
      nw => nw.name === networkData.name
    )
    if (cachedNetworkData) {
      this._loadToNodeData(cachedNetworkData, networkData, diagramOperator)
    }
  }

  /**
   * Load position data of each fixed-nodes.
   * (NOTICE: use "per network" to loading data)
   * @param {string} storageKey - Key of cache (localStorage)
   * @param {ForceSimulationNetworkData} networkData - Topology data to load.
   * @param {ForceSimulationDiagramOperator} diagramOperator - Visualizer.
   */
  loadToTopologyData(storageKey, networkData, diagramOperator) {
    const dataString = localStorage.getItem(storageKey)
    if (!dataString) {
      return
    }
    /** @type {TopologyPositionCache} */
    const storedData = JSON.parse(dataString)
    this._loadToNetwork(storedData, networkData, diagramOperator)
  }
}

export default PositionCache
