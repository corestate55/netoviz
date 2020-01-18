'use strict'
/**
 * @file Definition of layer2 term-point class of topology model.
 */

import RfcTermPoint from './term-point'
import RfcL2TermPointAttribute from './term-point-l2attr'

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

export default RfcL2TermPoint
