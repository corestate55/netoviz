'use strict'

const Link = require('./link')
const L3LinkAttribute = require('./link-l3attr')

module.exports = class L3Link extends Link {
  constructor (data, nwPath) {
    super(data, nwPath)
    const attrKey = 'ietf-l3-unicast-topology:l3-link-attributes' // alias
    this.attribute = new L3LinkAttribute(data[attrKey] || {}) // avoid undefined
  }
}
