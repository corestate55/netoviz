'use strict'

import Network from './network'
import L2Node from './l2node'
import L2Link from './l2link'
import L2NetworkAttribute from './network-l2attr'

export default class L2Network extends Network {
  constructor(data, nwNum) {
    super(data, nwNum)
    const attrKey = 'ietf-l2-topology:l2-topology-attributes'
    this.attribute = new L2NetworkAttribute(data[attrKey] || {}) // avoid undefined
  }

  newNode(data, index) {
    return new L2Node(data, this.path, this.id, index)
  }

  newLink(data) {
    return new L2Link(data, this.path)
  }
}
