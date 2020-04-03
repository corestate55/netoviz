/**
 * @file Definition of distance graph
 */

import markNeighborWithTarget from '../common/neighbor-maker'
import markFamilyWithTarget from '../common/family-maker'
import DistanceNode from './node'
import DistanceLink from './link'

/**
 * Distance graph.
 */
class DistanceTopology {
  /**
   * @param {DistanceGraphQuery} graphQuery - Graph query parameters.
   */
  constructor(graphQuery) {
    const networks = graphQuery.topologyData
    /** @type {Array<DistanceNode>} */
    this.nodes = this._correctArrays(networks, 'nodes').map(
      d => new DistanceNode(d)
    )
    /** @type {Array<DistanceLink>} */
    this.links = this._correctArrays(networks, 'links').map(
      d => new DistanceLink(d)
    )

    const target = graphQuery.target
    const layer = graphQuery.layer
    markFamilyWithTarget(this.nodes, target, layer)
    markNeighborWithTarget(this.nodes, this.links, target, layer)
  }

  /**
   * Correct nodes/links from each network(layer).
   * @param {ForceSimulationTopologyData} networks - Networks.
   * @param {string} attribute - nodes or links
   * @returns {Array<ForceSimulationNodeData>|Array<ForceSimulationLinkData>} Collected array.
   * @private
   */
  _correctArrays(networks, attribute) {
    return networks
      .map(nw => nw[attribute])
      .reduce((sum, arr) => sum.concat(arr), [])
  }

  /**
   * Convert to dependency graph data.
   * @returns {DistanceTopologyData}
   * @public
   */
  toData() {
    /**
     * @typedef {Object} DistanceTopologyData
     * @prop {Array<DistanceNode>} nodes - Nodes that has family/neighbor relation of target.
     * @prop {Array<DistanceLink>} links - Links (TODO: filtering by layer)
     */
    // (TODO: Temporary data, pre-visualize)
    return {
      nodes: this.nodes.filter(d => d.hasTargetRelation()),
      links: this.links.filter(d => d.isTypeTpTp())
    }
  }
}

export default DistanceTopology
