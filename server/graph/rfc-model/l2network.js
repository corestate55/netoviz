'use strict'
/**
 * @file Definition of layer2 network class of topology model.
 */

import RfcNetwork from './network'
import RfcL2Node from './l2node'
import RfcL2Link from './l2link'
import RfcL2NetworkAttribute from './network-l2attr'

/**
 * Layer2 network class.
 * @extends {RfcNetwork}
 */
class RfcL2Network extends RfcNetwork {
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

export default RfcL2Network
