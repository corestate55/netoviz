'use strict'

import {Link} from './link'

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
    let attrKey = 'ietf-l3-unicast-topology:l3-link-attributes' // alias
    this.attribute = new L3LinkAttribute(data[attrKey] || {}) // avoid undefined
  }
}
