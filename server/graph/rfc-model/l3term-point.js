'use strict'
/**
 * @file Definition of layer3 term-point class of topology model.
 */

import RfcTermPoint from './term-point'
import RfcL3TermPointAttribute from './term-point-l3attr'

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

export default RfcL3TermPoint
