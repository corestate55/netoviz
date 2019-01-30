'use strict'

import Link from './link'
import L2LinkAttribute from './link-l2attr'

export default class L2Link extends Link {
  constructor (data, nwPath) {
    super(data, nwPath)
    const attrKey = 'ietf-l2-topology:l2-link-attributes' // alias
    this.attribute = new L2LinkAttribute(data[attrKey] || {}) // avoid undefined
  }
}
