'use strict'
/**
 * @file Definition of graphs (multiple-graph container) class for topology diagram.
 */

import BaseContainer from '../common/base'
import Networks from '../topo-model/networks'
import TopologyGraph from './graph'

/**
 * Graphs for topology diagram.
 * @extends {BaseContainer}
 */
class TopologyGraphs extends BaseContainer {
  /**
   * @param {RfcTopologyData} rfcTopologyData - RFC8345 topology data.
   */
  constructor(rfcTopologyData) {
    super()
    /** @type {Networks} */
    this.topoModel = new Networks(rfcTopologyData)
    /** @type {Array<TopologyGraph>} */
    this.graphs = this.topoModel.networks.map(nw => new TopologyGraph(nw))
    /** @type {Array<TopologyGraphNode>} */
    this.allGraphNodes = this._makeAllGraphNodes()
    this._makeParentRef()
    this._resolveLinkRef()
  }

  /**
   * Make all graph-node.
   * @returns {Array<TopologyGraphNode>} All tp/node type graph-node.
   * @private
   */
  _makeAllGraphNodes() {
    const allGraphNodes = this.graphs.map(graph => graph.nodes)
    return this.flatten(allGraphNodes)
  }

  /**
   * Find graph-node by path.
   * @param {string} path - Path of node.
   * @returns {TopologyGraphNode} Found graph-node.
   * @private
   */
  _findGraphNodeByPath(path) {
    return this.allGraphNodes.find(d => d.path === path)
  }

  /**
   * Make reference of parents.
   * @private
   */
  _makeParentRef() {
    for (const node of this.allGraphNodes) {
      if (node.children) {
        for (const path of node.children) {
          const child = this._findGraphNodeByPath(path)
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
   * @param {TopologyGraphNode} target - Node.
   * @param {TopologyGraphLink} link - Link.
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
    for (const graph of this.graphs) {
      for (const link of graph.links) {
        const source = this._findGraphNodeByPath(link.sourcePath)
        const target = this._findGraphNodeByPath(link.targetPath)
        this._errorLinkEndNodeNotFound('Source', source, link)
        this._errorLinkEndNodeNotFound('Target', target, link)
        link.sourceId = source.id
        link.targetId = target.id
      }
    }
  }

  /**
   * Convert Networks to TopologyGraphs.
   * @returns {TopologyGraphsData} Graph data for topology view.
   * @public
   */
  toData() {
    /** @typedef {Array<TopologyGraphData>} TopologyGraphsData */
    return this.graphs
  }
}

export default TopologyGraphs
