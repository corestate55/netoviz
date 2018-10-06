'use strict'

import { TopoBaseContainer } from './base'
import { Network } from './network'
import { L2Node, L3Node } from './aug-node'
import { L2Link, L3Link } from './aug-link'

class L2NetworkAttribute extends TopoBaseContainer {
  constructor (data) {
    super(data)
    this.name = data.name || ''
    this.flag = data.flag || [] // list
  }
}

export class L2Network extends Network {
  constructor (data, nwNum) {
    super(data, nwNum)
    const attrKey = 'ietf-l2-topology:l2-topology-attributes'
    this.attribute = new L2NetworkAttribute(data[attrKey] || {}) // avoid undefined
  }

  newNode (data, index) {
    return new L2Node(data, this.path, this.id, index)
  }

  newLink (data) {
    return new L2Link(data, this.path)
  }
}

class L3NetworkAttribute extends TopoBaseContainer {
  constructor (data) {
    super(data)
    this.name = data.name || ''
    this.flag = data.flag || []
  }
}

export class L3Network extends Network {
  constructor (data, nwNum) {
    super(data, nwNum)
    const attrKey = 'ietf-l3-unicast-topology:l3-topology-attributes'
    this.attribute = new L3NetworkAttribute(data[attrKey] || {}) // avoid undefined
  }

  newNode (data, index) {
    return new L3Node(data, this.path, this.id, index)
  }

  newLink (data) {
    return new L3Link(data, this.path)
  }
}
