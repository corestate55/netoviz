'use strict'
/**
 * @file Definition of term-point and supporting-tp class of topology model.
 */

import ForceSimulationNode from '../force-simulation/node'
import ForceSimulationLink from '../force-simulation/link'
import RfcModelBase from './base'

/**
 * Supporting term-point of topology model.
 * @extends {RfcModelBase}
 */
class RfcSupportingTermPoint extends RfcModelBase {
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
 * @extends {RfcModelBase}
 */
class RfcTermPoint extends RfcModelBase {
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
    /** @type {Array<RfcSupportingTermPoint>} */
    this.supportingTermPoints = []
    const stpKey = 'supporting-termination-point' // alias
    if (data[stpKey]) {
      this.supportingTermPoints = data[stpKey].map(
        (d) => new RfcSupportingTermPoint(d)
      )
    }
  }

  /**
   * Make children. (nodes in under layer)
   * @returns {Array<string>} Paths of children.
   * @private
   */
  _makeChildren() {
    const children = this.supportingTermPoints.map((stp) => stp.refPath)
    children.unshift(this.parentPath)
    return children
  }

  /**
   * Convert RfcTermPoint to ForceSimulationNode (tp-type node).
   * @returns {ForceSimulationNode}
   * @public
   */
  graphNode() {
    return new ForceSimulationNode({
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
   * Convert RfcTermPoint to ForceSimulationLink.
   * @returns {ForceSimulationLink}
   * @public
   */
  graphLink() {
    const pathList = this.parentPath.split('__')
    const nodeName = pathList.pop()
    const linkName = [nodeName, this.name].join(',')
    return new ForceSimulationLink({
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

export default RfcTermPoint
