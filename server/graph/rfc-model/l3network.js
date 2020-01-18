'use strict'
/**
 * @file Definition of layer3 network class of topology model.
 */

import RfcNetwork from './network'
import RfcL3Node from './l3node'
import RfcL3Link from './l3link'
import RfcL3NetworkAttribute from './network-l3attr'

/**
 * Layer3 network class.
 * @extends {RfcNetwork}
 */
class RfcL3Network extends RfcNetwork {
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

export default RfcL3Network
