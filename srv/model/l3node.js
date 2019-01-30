'use strict'

import Node from './node'
import L3TermPoint from './l3term-point'
import L3NodeAttribute from './node-l3attr'

export default class L3Node extends Node {
  constructor (data, nwPath, nwId, nodeNum) {
    super(data, nwPath, nwId, nodeNum)
    const attrKey = 'ietf-l3-unicast-topology:l3-node-attributes' // alias
    this.attribute = new L3NodeAttribute(data[attrKey] || {}) // avoid undefined
  }

  newTP (data, index) {
    return new L3TermPoint(data, this.path, this.id, index)
  }
}
