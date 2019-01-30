'use strict'

import TermPoint from './term-point'
import L2TPAttribute from './term-point-l2attr'

export default class L2TermPoint extends TermPoint {
  constructor (data, nodePath, nodeId, tpNum) {
    super(data, nodePath, nodeId, tpNum)
    const attrKey = 'ietf-l2-topology:l2-termination-point-attributes' // alias
    this.attribute = new L2TPAttribute(data[attrKey] || {}) // avoid undefined
  }
}
