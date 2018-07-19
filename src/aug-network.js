'use strict'

import {Network} from './network'
import {L3Node} from './aug-node'
import {L3Link} from './aug-link'

class L3NetworkAttributes {
  constructor (data) {
    this.name = data.name || ''
    this.flag = data.flag || []
  }
}

export class L3Network extends Network {
  constructor (data, nwNum) {
    super(data, nwNum)
    let attrKey = 'ietf-l3-unicast-topology:l3-topology-attributes'
    this.attribute = new L3NetworkAttributes(data[attrKey] || {}) // avoid undefined
  }

  newNode (data, index) {
    return new L3Node(data, this.path, this.id, index)
  }

  newLink (data) {
    return new L3Link(data, this.path)
  }
}
