'use strict'
/**
 * @file Definition of layer3 term-point class of topology model.
 */

import TermPoint from './term-point'
import L3TPAttribute from './term-point-l3attr'

/**
 * Layer3 term-point of topology model.
 * @extends {TermPoint}
 */
class L3TermPoint extends TermPoint {
  /**
   * @override
   */
  constructor(data, nodePath, nodeId, tpNum) {
    super(data, nodePath, nodeId, tpNum)
    const attrKey = 'ietf-l3-unicast-topology:l3-termination-point-attributes' // alias
    /** @type {L3TPAttribute} */
    this.attribute = new L3TPAttribute(data[attrKey] || {}) // avoid undefined
  }
}

export default L3TermPoint
