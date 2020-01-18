'use strict'
/**
 * @file Definition of layer2 term-point class of topology model.
 */

import TermPoint from './term-point'
import L2TPAttribute from './term-point-l2attr'

/**
 * Layer2 term-point of topology model.
 * @extends {TermPoint}
 */
class L2TermPoint extends TermPoint {
  /**
   * @override
   */
  constructor(data, nodePath, nodeId, tpNum) {
    super(data, nodePath, nodeId, tpNum)
    const attrKey = 'ietf-l2-topology:l2-termination-point-attributes' // alias
    /** @type {L2TPAttribute} */
    this.attribute = new L2TPAttribute(data[attrKey] || {}) // avoid undefined
  }
}

export default L2TermPoint
