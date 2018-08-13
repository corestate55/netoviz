'use strict'

import {Link} from './link'

class L2LinkAttribute {
  constructor (data) {
    this.name = data.name || ''
    this.flag = data.flag || ''
    this.rate = data.rate || 100
    this.delay = data.delay || 0
    this.srlg = data.srlg || 0
  }
}

export class L2Link extends Link {
  constructor (data, nwPath) {
    super(data, nwPath)
    const attrKey = 'ietf-l2-topology:l2-link-attributes' // alias
    this.attribute = new L2LinkAttribute(data[attrKey] || {}) // avoid undefined
  }
}

class L3LinkAttribute {
  constructor (data) {
    this.name = data.name || ''
    this.flag = data.flag || ''
    this.metric1 = data.metric1 || 100
    this.metric2 = data.metric2 || 100
  }
}

export class L3Link extends Link {
  constructor (data, nwPath) {
    super(data, nwPath)
    const attrKey = 'ietf-l3-unicast-topology:l3-link-attributes' // alias
    this.attribute = new L3LinkAttribute(data[attrKey] || {}) // avoid undefined
  }
}
