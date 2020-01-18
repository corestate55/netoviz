'use strict'
/**
 * @file Definition of layer3 node class of topology model.
 */

import RfcNode from './node'
import RfcL3TermPoint from './l3term-point'
import RfcL3NodeAttribute from './node-l3attr'

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

export default RfcL3Node
