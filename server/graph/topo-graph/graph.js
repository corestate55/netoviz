'use strict'
/**
 * @file Definition of graph class for topology diagram.
 */

/**
 * Graph for topology diagram.
 */
class TopologyGraph {
  /**
   * @typedef {TopologyGraph} TopologyGraphData
   */
  /**
   * @param {Network} network
   */
  constructor(network) {
    /** @type {string} */
    this.name = network.name
    /** @type {Array<TopologyGraphNode>} */
    this.nodes = network.makeGraphNodes()
    /** @type {Array<TopologyGraphLink>} */
    this.links = network.makeGraphLinks()
    /** @type {DiffState} */
    this.diffState = network.diffState
  }
}

export default TopologyGraph
