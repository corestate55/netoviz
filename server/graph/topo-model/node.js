'use strict'
/**
 * @file Definition of node and supporting-node class of topology model.
 */

import TopologyGraphNode from '../topo-graph/graph-node'
import TopoBaseContainer from './topo-base'
import TermPoint from './term-point'

/**
 * Supporting node of topology model.
 * @extends {TopoBaseContainer}
 */
class SupportingNode extends TopoBaseContainer {
  /**
   * @typedef {Object} RfcSupportingNodeData
   * @prop {string} network-ref Network name.
   * @prop {string} node-ref Node name.
   */
  /**
   * @param {RfcSupportingNodeData} data - Data of supporting node.
   */
  constructor(data) {
    super(data)
    /** @type {string} */
    this.networkRef = data['network-ref']
    /** @type {string} */
    this.nodeRef = data['node-ref']
    /** @type {string} */
    this.refPath = [this.networkRef, this.nodeRef].join('__')
  }
}

/**
 * Node of topology model.
 * @extends {TopoBaseContainer}
 */
class Node extends TopoBaseContainer {
  /**
   * @typedef {Object} RfcNodeData
   * @prop {string} node-id Name of node.
   * @prop {Array<RfcSupportingNodeData>} supporting-node - Supporting nodes.
   * @prop {Array<RfcTermPointData>} ietf-network-topology:termination-point - Term-points.
   */
  /**
   * @param {RfcNodeData} data - Node data.
   * @param {string} nwPath - Path of network (contains this node).
   * @param {number} nwId - ID of network.
   * @param {number} nodeNum - ID of node.
   */
  constructor(data, nwPath, nwId, nodeNum) {
    super(data)
    /** @type {string} */
    this.name = data['node-id'] // name string
    /** @type {number} */
    this.id = nwId + nodeNum * 100
    /** @type {string} */
    this.parentPath = nwPath
    /** @type {string} */
    this.path = [this.parentPath, this.name].join('__')
    /** @type {Object} */
    this.attribute = {} // for extension
    this._constructSupportingNodes(data)
    this._constructTermPoints(data)
  }

  /**
   * Construct term-points.
   * @param {RfcNodeData} data - Node data.
   * @private
   */
  _constructTermPoints(data) {
    /** @type {Array<TermPoint|L2TermPoint|L3TermPoint>} */
    this.termPoints = []
    const tpKey = 'ietf-network-topology:termination-point' // alias
    if (data[tpKey]) {
      this.termPoints = data[tpKey].map((d, i) => {
        return this.newTP(d, i + 1)
      })
    }
  }

  /**
   * Create (new) term-point.
   * @param {RfcTermPointData} data - Term-point data.
   * @param {number} tpNum - ID of term-point.
   * @returns {TermPoint} Term-point.
   * @protected
   */
  newTP(data, tpNum) {
    return new TermPoint(data, this.path, this.id, tpNum)
  }

  /**
   * Construct supporting nodes.
   * @param {RfcNodeData} data - Node data.
   * @private
   */
  _constructSupportingNodes(data) {
    /** @type {Array<SupportingNode>} */
    this.supportingNodes = []
    if (data['supporting-node']) {
      this.supportingNodes = data['supporting-node'].map(
        d => new SupportingNode(d)
      )
    }
  }

  /**
   * Find term-point in this node by path.
   * @param {string} path - Path of term-point.
   * @returns {TermPoint}
   * @public
   */
  findTpByPath(path) {
    return this.termPoints.find(d => d.path === path)
  }

  /**
   * Make children (paths of children nodes in underlay layer).
   * @returns {Array<string>}
   * @private
   */
  _makeChildren() {
    return this.supportingNodes.map(sn => sn.refPath)
  }

  /**
   * Convert Node to TopologyGraphNode (node-type node).
   * @returns {TopologyGraphNode}
   * @public
   */
  graphNode() {
    return new TopologyGraphNode({
      type: 'node',
      name: this.name,
      id: this.id,
      path: this.path,
      children: this._makeChildren(),
      parents: [],
      attribute: this.attribute,
      diffState: this.diffState
    })
  }
}

export default Node
