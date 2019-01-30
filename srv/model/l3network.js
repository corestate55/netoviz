'use strict'

import Network from './network'
import L3Node from './l3node'
import L3Link from './l3link'
import L3NetworkAttribute from './network-l3attr'

export default class L3Network extends Network {
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
