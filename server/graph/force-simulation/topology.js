'use strict'
/**
 * @file Definition of topology for force-simulation network diagram.
 */

import BaseContainer from '../common/base'
import RfcTopology from '../rfc-model/topology'
import ForceSimulationNetwork from './network'

/**
 * Graphs for topology diagram.
 * @extends {BaseContainer}
 */
class ForceSimulationTopology extends BaseContainer {
  /**
   * @param {RfcTopologyData} rfcTopologyData - RFC8345 topology data.
   */
  constructor(rfcTopologyData) {
    super()
    /** @type {RfcTopology} */
    this.rfcTopology = new RfcTopology(rfcTopologyData)
    /** @type {Array<ForceSimulationNetwork>} */
    this.networks = this.rfcTopology.networks.map(
      nw => new ForceSimulationNetwork(nw)
    )
    /** @type {Array<ForceSimulationNode>} */
    this.nodes = this._makeNodes()
    this._makeParentRef()
    this._resolveLinkRef()
  }

  /**
   * Make nodes (collect from all networks).
   * @returns {Array<ForceSimulationNode>} All tp/node type graph-node.
   * @private
   */
  _makeNodes() {
    const nodesOfLayers = this.networks.map(nw => nw.nodes)
    return this.flatten(nodesOfLayers)
  }

  /**
   * Find node by path.
   * @param {string} path - Path of node.
   * @returns {ForceSimulationNode} Found graph-node.
   * @private
   */
  _findNodeByPath(path) {
    return this.nodes.find(d => d.path === path)
  }

  /**
   * Make reference of parents.
   * @private
   */
  _makeParentRef() {
    for (const node of this.nodes) {
      if (node.children) {
        for (const path of node.children) {
          const child = this._findNodeByPath(path)
          if (child) {
            child.addParent(node.path)
          } // TODO error check (when not found?)
        }
      }
    }
  }

  /**
   * Print error if node in one of link-end is not found.
   * @param {string} targetStr - Kind of node.
   * @param {ForceSimulationNode} target - Node.
   * @param {ForceSimulationLink} link - Link.
   * @private
   */
  _errorLinkEndNodeNotFound(targetStr, target, link) {
    if (!target) {
      console.error(`${targetStr} does not found, in link:`, link)
    }
  }

  /**
   * Resolve source/target id of link with searching link-endpoint node.
   * @private
   */
  _resolveLinkRef() {
    for (const graph of this.networks) {
      for (const link of graph.links) {
        const source = this._findNodeByPath(link.sourcePath)
        const target = this._findNodeByPath(link.targetPath)
        this._errorLinkEndNodeNotFound('Source', source, link)
        this._errorLinkEndNodeNotFound('Target', target, link)
        link.sourceId = source.id
        link.targetId = target.id
      }
    }
  }

  /**
   * Convert networks to ForceSimulationTopology.
   * @returns {ForceSimulationTopologyData} Graph data for topology view.
   * @public
   */
  toData() {
    /**
     * @typedef {Array<ForceSimulationNetworkData>} ForceSimulationTopologyData
     */
    return this.networks
  }
}

export default ForceSimulationTopology
