'use strict'

import Link from './link'
import L3LinkAttribute from './link-l3attr'

export default class L3Link extends Link {
  constructor (data, nwPath) {
    super(data, nwPath)
    const attrKey = 'ietf-l3-unicast-topology:l3-link-attributes' // alias
    this.attribute = new L3LinkAttribute(data[attrKey] || {}) // avoid undefined
  }
}
