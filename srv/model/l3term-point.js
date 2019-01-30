'use strict'

import TermPoint from './term-point'
import L3TPAttribute from './term-point-l3attr'

export default class L3TermPoint extends TermPoint {
  constructor (data, nodePath, nodeId, tpNum) {
    super(data, nodePath, nodeId, tpNum)
    const attrKey = 'ietf-l3-unicast-topology:l3-termination-point-attributes' // alias
    this.attribute = new L3TPAttribute(data[attrKey] || {}) // avoid undefined
  }
}
