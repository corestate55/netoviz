'use strict'
/**
 * @file Definition of layer3 network class of topology model.
 */

import Network from './network'
import L3Node from './l3node'
import L3Link from './l3link'
import L3NetworkAttribute from './network-l3attr'

/**
 * Layer3 network class.
 * @extends {Network}
 */
class L3Network extends Network {
  /**
   * @override
   */
  constructor(data, nwNum) {
    super(data, nwNum)
    const attrKey = 'ietf-l3-unicast-topology:l3-topology-attributes'
    this.attribute = new L3NetworkAttribute(data[attrKey] || {}) // avoid undefined
  }

  /**
   * @override
   * @returns {L3Node}
   */
  newNode(data, index) {
    return new L3Node(data, this.path, this.id, index)
  }

  /**
   * @override
   * @returns {L3Link}
   */
  newLink(data) {
    return new L3Link(data, this.path)
  }
}

export default L3Network
