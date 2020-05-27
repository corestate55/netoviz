/**
 * @file definition of L2-type network elements.
 */

import RfcTermPoint from './term-point'
import RfcNode from './node'
import RfcLink from './link'
import RfcNetwork from './network'
import {
  MultiPurposeTermPointAttribute,
  MultiPurposeNodeAttribute,
  MultiPurposeLinkAttribute,
  MultiPurposeNetworkAttribute
} from './mpattr'

/**
 * Multi-purpose term-point.
 * @extends {RfcTermPoint}
 */
class MultiPurposeTermPoint extends RfcTermPoint {
  /**
   * @override
   */
  constructor(data, nodePath, nodeId, tpNum) {
    super(data, nodePath, nodeId, tpNum)
    const attrKey = 'multi-purpose-termination-point-attributes' // alias
    /** @type {MultiPurposeTermPointAttribute} */
    this.attribute = new MultiPurposeTermPointAttribute(data[attrKey] || {})
  }
}

/**
 * Multi-purpose node.
 * @extends {RfcNetwork}
 */
class MultiPurposeNode extends RfcNode {
  /**
   * @override
   */
  constructor(data, nwPath, nwId, nodeNum) {
    super(data, nwPath, nwId, nodeNum)
    const attrKey = 'multi-purpose-node-attributes' // alias
    this.attribute = new MultiPurposeNodeAttribute(data[attrKey] || {})
  }

  /**
   * @override
   * @returns {MultiPurposeTermPoint}
   */
  newTP(data, index) {
    return new MultiPurposeTermPoint(data, this.path, this.id, index)
  }
}

/**
 * Multi-purpose link.
 * @extends {RfcLink}
 */
class MultiPurposeLink extends RfcLink {
  /**
   * @override
   */
  constructor(data, nwPath) {
    super(data, nwPath)
    const attrKey = 'multi-purpose-link-attributes'
    this.attribute = new MultiPurposeLinkAttribute(data[attrKey] || {})
  }
}

/**
 * Multi-purpose network.
 * @extends {RfcNetwork}
 */
export class MultiPurposeNetwork extends RfcNetwork {
  constructor(data, nwNum) {
    super(data, nwNum)
    const attrKey = 'multi-purpose-network-attributes'
    /** @type {MultiPurposeNetworkAttribute} */
    this.attribute = new MultiPurposeNetworkAttribute(data[attrKey] || {})
  }

  /**
   * @override
   * @returns {MultiPurposeNode}
   */
  newNode(data, index) {
    return new MultiPurposeNode(data, this.path, this.id, index)
  }

  /**
   * @override
   * @returns {MultiPurposeLink}
   */
  newLink(data) {
    return new MultiPurposeLink(data, this.path)
  }
}
