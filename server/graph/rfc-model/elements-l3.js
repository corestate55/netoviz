/**
 * @file definition of L3-type network elements.
 */

import RfcTermPoint from './term-point'
import RfcNode from './node'
import RfcLink from './link'
import RfcNetwork from './network'
import RfcL3TermPointAttribute from './term-point-l3attr'
import RfcL3NodeAttribute from './node-l3attr'
import RfcL3LinkAttribute from './link-l3attr'
import RfcL3NetworkAttribute from './network-l3attr'

/**
 * Layer3 term-point of topology model.
 * @extends {RfcTermPoint}
 */
class RfcL3TermPoint extends RfcTermPoint {
  /**
   * @override
   */
  constructor(data, nodePath, nodeId, tpNum) {
    super(data, nodePath, nodeId, tpNum)
    const attrKey = 'ietf-l3-unicast-topology:l3-termination-point-attributes' // alias
    /** @type {RfcL3TermPointAttribute} */
    this.attribute = new RfcL3TermPointAttribute(data[attrKey] || {}) // avoid undefined
  }
}

/**
 * Layer3 node class.
 * @extends {RfcNode}
 */
class RfcL3Node extends RfcNode {
  /**
   * @override
   */
  constructor(data, nwPath, nwId, nodeNum) {
    super(data, nwPath, nwId, nodeNum)
    const attrKey = 'ietf-l3-unicast-topology:l3-node-attributes' // alias
    this.attribute = new RfcL3NodeAttribute(data[attrKey] || {}) // avoid undefined
  }

  /**
   * @override
   * @returns {RfcL3TermPoint}
   */
  newTP(data, index) {
    return new RfcL3TermPoint(data, this.path, this.id, index)
  }
}

/**
 * Layer3 link class.
 * @extends {RfcLink}
 */
class RfcL3Link extends RfcLink {
  /**
   * @override
   */
  constructor(data, nwPath) {
    super(data, nwPath)
    const attrKey = 'ietf-l3-unicast-topology:l3-link-attributes' // alias
    /** @type {RfcL3LinkAttribute} */
    this.attribute = new RfcL3LinkAttribute(data[attrKey] || {}) // avoid undefined
  }
}

/**
 * Layer3 network class.
 * @extends {RfcNetwork}
 */
export class RfcL3Network extends RfcNetwork {
  /**
   * @override
   */
  constructor(data, nwNum) {
    super(data, nwNum)
    const attrKey = 'ietf-l3-unicast-topology:l3-topology-attributes'
    this.attribute = new RfcL3NetworkAttribute(data[attrKey] || {}) // avoid undefined
  }

  /**
   * @override
   * @returns {RfcL3Node}
   */
  newNode(data, index) {
    return new RfcL3Node(data, this.path, this.id, index)
  }

  /**
   * @override
   * @returns {RfcL3Link}
   */
  newLink(data) {
    return new RfcL3Link(data, this.path)
  }
}
