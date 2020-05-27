/**
 * @file definition of L2-type network elements.
 */

import RfcTermPoint from './term-point'
import RfcNode from './node'
import RfcLink from './link'
import RfcNetwork from './network'
import RfcL2TermPointAttribute from './term-point-l2attr'
import RfcL2NodeAttribute from './node-l2attr'
import RfcL2LinkAttribute from './link-l2attr'
import RfcL2NetworkAttribute from './network-l2attr'

/**
 * Layer2 term-point of topology model.
 * @extends {RfcTermPoint}
 */
class RfcL2TermPoint extends RfcTermPoint {
  /**
   * @override
   */
  constructor(data, nodePath, nodeId, tpNum) {
    super(data, nodePath, nodeId, tpNum)
    const attrKey = 'ietf-l2-topology:l2-termination-point-attributes' // alias
    /** @type {RfcL2TermPointAttribute} */
    this.attribute = new RfcL2TermPointAttribute(data[attrKey] || {}) // avoid undefined
  }
}

/**
 * Layer2 node class.
 * @extends {RfcNode}
 */
class RfcL2Node extends RfcNode {
  /**
   * @override
   */
  constructor(data, nwPath, nwId, nodeNum) {
    super(data, nwPath, nwId, nodeNum)
    const attrKey = 'ietf-l2-topology:l2-node-attributes' // alias
    /** @type{RfcL2NodeAttribute} */
    this.attribute = new RfcL2NodeAttribute(data[attrKey] || {}) // avoid undefined
  }

  /**
   * @override
   * @returns {RfcL2TermPoint}
   */
  newTP(data, index) {
    return new RfcL2TermPoint(data, this.path, this.id, index)
  }
}

/**
 * Layer2 link class.
 * @extends {RfcLink}
 */
class RfcL2Link extends RfcLink {
  /**
   * @override
   */
  constructor(data, nwPath) {
    super(data, nwPath)
    const attrKey = 'ietf-l2-topology:l2-link-attributes' // alias
    /** @type {RfcL2LinkAttribute} */
    this.attribute = new RfcL2LinkAttribute(data[attrKey] || {}) // avoid undefined
  }
}

/**
 * Layer2 network class.
 * @extends {RfcNetwork}
 */
export class RfcL2Network extends RfcNetwork {
  /**
   * @override
   */
  constructor(data, nwNum) {
    super(data, nwNum)
    const attrKey = 'ietf-l2-topology:l2-topology-attributes'
    /** @type {RfcL2NetworkAttribute} */
    this.attribute = new RfcL2NetworkAttribute(data[attrKey] || {}) // avoid undefined
  }

  /**
   * @override
   * @returns {RfcL2Node}
   */
  newNode(data, index) {
    return new RfcL2Node(data, this.path, this.id, index)
  }

  /**
   * @override
   * @returns {RfcL2Link}
   */
  newLink(data) {
    return new RfcL2Link(data, this.path)
  }
}
