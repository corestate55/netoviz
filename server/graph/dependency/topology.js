/**
 * @file Definition of dependency graph.
 */

import markFamilyWithTarget from '../common/family-maker'
import DependencyNetwork from './network'

/**
 * Dependency graph.
 */
class DependencyTopology {
  /**
   * @param {DependencyGraphQuery} graphQuery - Graph query parameters.
   */
  constructor(graphQuery) {
    const foundTarget = this._markFamilyWithTarget(
      graphQuery.topologyData,
      graphQuery.target
    )
    this._setNetworks(graphQuery.topologyData, foundTarget)
  }

  /**
   * Mark family (parent/children) information.
   * @param {ForceSimulationTopologyData} topologyData - Graph data.
   * @param {string} target - Target node to highlight.
   * @returns {boolean} True if target found.
   * @private
   */
  _markFamilyWithTarget(topologyData, target) {
    const nodes = topologyData
      .map((network) => network.nodes)
      .reduce((sum, nodes) => sum.concat(nodes), [])
    return markFamilyWithTarget(nodes, target)
  }

  /**
   * Set network.
   * @param {ForceSimulationTopologyData} topologyData - Graph data.
   * @param foundTarget
   * @private
   */
  _setNetworks(topologyData, foundTarget) {
    this.networks = topologyData.map(
      (nw, nwIndex) => new DependencyNetwork(nwIndex + 1, nw, foundTarget)
    )
  }

  /**
   * Convert to dependency graph data.
   * @returns {DependencyTopologyData}
   */
  toData() {
    /**
     * @typedef {Array<DependencyNetworkData>} DependencyTopologyData
     */
    return this.networks.map((network) => network.toData())
  }
}

export default DependencyTopology
