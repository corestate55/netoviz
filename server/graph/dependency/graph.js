/**
 * @file Definition of dependency graph.
 */

import markFamilyWithTarget from '../common/family-maker'
import DepGraphLayer from './layer'

/**
 * Dependency graph.
 */
class DependencyGraph {
  /**
   * @param {DependencyGraphQuery} graphQuery - Graph query parameters.
   */
  constructor(graphQuery) {
    const foundTarget = this._markFamilyWithTarget(
      graphQuery.graphData,
      graphQuery.target
    )
    this._setLayers(graphQuery.graphData, foundTarget)
  }

  /**
   * Mark family (parent/children) information.
   * @param {TopologyGraphsData} graphData - Graph data.
   * @param {string} target - Target node to highlight.
   * @returns {boolean} True if target found.
   * @private
   */
  _markFamilyWithTarget(graphData, target) {
    const nodes = graphData
      .map(l => l.nodes)
      .reduce((sum, nodes) => sum.concat(nodes), [])
    return markFamilyWithTarget(nodes, target)
  }

  /**
   * Set network as 'layer'.
   * @param {TopologyGraphsData} graphData - Graph data.
   * @param foundTarget
   * @private
   */
  _setLayers(graphData, foundTarget) {
    this.layers = []
    let layerNum = 1
    for (const layer of graphData) {
      this.layers.push(new DepGraphLayer(layerNum, layer, foundTarget))
      layerNum += 1
    }
  }

  /**
   * Convert to dependency graph data.
   * @returns {DependencyGraphData}
   */
  toData() {
    /**
     * @typedef {Array<DependencyGraphNetworkData>} DependencyGraphData
     */
    return this.layers.map(layer => layer.toData())
  }
}

export default DependencyGraph
