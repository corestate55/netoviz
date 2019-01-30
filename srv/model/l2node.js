'use strict'

import Node from './node'
import L2TermPoint from './l2term-point'
import L2NodeAttribute from './node-l2attr'

export default class L2Node extends Node {
  constructor (data, nwPath, nwId, nodeNum) {
    super(data, nwPath, nwId, nodeNum)
    const attrKey = 'ietf-l2-topology:l2-node-attributes' // alias
    this.attribute = new L2NodeAttribute(data[attrKey] || {}) // avoid undefined
  }

  newTP (data, index) {
    return new L2TermPoint(data, this.path, this.id, index)
  }
}
