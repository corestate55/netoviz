'use strict'
/**
 * @file Definition of term-point and supporting-tp class of topology model.
 */

import TopologyGraphNode from '../topo-graph/graph-node'
import TopologyGraphLink from '../topo-graph/graph-link'
import TopoBaseContainer from './topo-base'

/**
 * Supporting term-point of topology model.
 * @extends {TopoBaseContainer}
 */
class SupportingTermPoint extends TopoBaseContainer {
  /**
   * @typedef {Object} RfcSupportingTermPointData
   * @prop {string} network-ref - Network name.
   * @prop {string} node-ref - Node name.
   * @prop {string} tp-ref - Term-point name.
   */
  /**
   * @param {RfcSupportingTermPointData} data - Data of supporting-term-point
   */
  constructor(data) {
    super(data)
    /** @type {string} */
    this.networkRef = data['network-ref']
    /** @type {string} */
    this.nodeRef = data['node-ref']
    /** @type {string} */
    this.tpRef = data['tp-ref']
    /** @type {string} */
    this.refPath = [this.networkRef, this.nodeRef, this.tpRef].join('__')
  }
}

/**
 * Term-point of topology model.
 * @extends {TopoBaseContainer}
 */
class TermPoint extends TopoBaseContainer {
  /**
   * @typedef {Object} RfcTermPointData
   * @prop {string} tp-id - Name of tp.
   * @prop {Array<RfcSupportingTermPointData>} supporting-termination-point - Supporting-term-point.
   */
  /**
   * @param {RfcTermPointData} data - Node data.
   * @param {string} nodePath - Path of node (contains this term-point).
   * @param {number} nodeId - ID of node.
   * @param {number} tpNum - ID of term-point.
   */
  constructor(data, nodePath, nodeId, tpNum) {
    super(data)
    /** @type {string} */
    this.name = data['tp-id'] // name string
    /** @type {number} */
    this.id = nodeId + tpNum
    /** @type {string} */
    this.parentPath = nodePath
    /** @type {string} */
    this.path = [this.parentPath, this.name].join('__')
    /** @type {Object} */
    this.attribute = {} // for extension
    this._constructSupportingTermPoints(data)
  }

  /**
   * Construct supporting-term-points.
   * @param {RfcTermPointData} data - Term-point data.
   * @private
   */
  _constructSupportingTermPoints(data) {
    /** @type {Array<SupportingTermPoint>} */
    this.supportingTermPoints = []
    const stpKey = 'supporting-termination-point' // alias
    if (data[stpKey]) {
      this.supportingTermPoints = data[stpKey].map(
        d => new SupportingTermPoint(d)
      )
    }
  }

  /**
   * Make children. (nodes in under layer)
   * @returns {Array<string>} Paths of children.
   * @private
   */
  _makeChildren() {
    const children = this.supportingTermPoints.map(stp => stp.refPath)
    children.unshift(this.parentPath)
    return children
  }

  /**
   * Convert TermPoint to TopologyGraphNode (tp-type node).
   * @returns {TopologyGraphNode}
   * @public
   */
  graphNode() {
    return new TopologyGraphNode({
      type: 'tp',
      name: this.name,
      id: this.id,
      path: this.path,
      children: this._makeChildren(),
      parents: [],
      attribute: this.attribute,
      diffState: this.diffState
    })
  }

  /**
   * Convert TermPoint to TopologyGraphLink.
   * @returns {TopologyGraphLink}
   * @public
   */
  graphLink() {
    const pathList = this.parentPath.split('__')
    const nodeName = pathList.pop()
    const linkName = [nodeName, this.name].join(',')
    return new TopologyGraphLink({
      type: 'node-tp',
      sourcePath: this.parentPath,
      targetPath: this.path,
      name: linkName,
      path: [pathList, linkName].join('__'),
      attribute: {}, // Notice (Link attribute does not implemented yet)
      diffState: this.diffState
    })
  }
}

export default TermPoint
