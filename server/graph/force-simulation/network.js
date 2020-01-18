'use strict'
/**
 * @file Definition of graph class for topology diagram.
 */

/**
 * Graph for topology diagram.
 */
class ForceSimulationNetwork {
  /**
   * @typedef {ForceSimulationNetwork} ForceSimulationNetworkData
   */
  /**
   * @param {RfcNetwork} network - Network of topology model.
   */
  constructor(network) {
    /** @type {string} */
    this.name = network.name
    /** @type {Array<ForceSimulationNode>} */
    this.nodes = network.makeGraphNodes()
    /** @type {Array<ForceSimulationLink>} */
    this.links = network.makeGraphLinks()
    /** @type {DiffState} */
    this.diffState = network.diffState
  }
}

export default ForceSimulationNetwork
