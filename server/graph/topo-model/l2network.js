'use strict'
/**
 * @file Definition of layer2 network class of topology model.
 */

import Network from './network'
import L2Node from './l2node'
import L2Link from './l2link'
import L2NetworkAttribute from './network-l2attr'

/**
 * Layer2 network class.
 * @extends {Network}
 */
class L2Network extends Network {
  /**
   * @override
   */
  constructor(data, nwNum) {
    super(data, nwNum)
    const attrKey = 'ietf-l2-topology:l2-topology-attributes'
    /** @type {L2NetworkAttribute} */
    this.attribute = new L2NetworkAttribute(data[attrKey] || {}) // avoid undefined
  }

  /**
   * @override
   * @returns {L2Node}
   */
  newNode(data, index) {
    return new L2Node(data, this.path, this.id, index)
  }

  /**
   * @override
   * @returns {L2Link}
   */
  newLink(data) {
    return new L2Link(data, this.path)
  }
}

export default L2Network
