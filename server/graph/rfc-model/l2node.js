'use strict'
/**
 * @file Definition of layer2 node class of topology model.
 */

import RfcNode from './node'
import RfcL2TermPoint from './l2term-point'
import RfcL2NodeAttribute from './node-l2attr'

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

export default RfcL2Node
