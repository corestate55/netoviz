'use strict'

const Link = require('./link')
const L2LinkAttribute = require('./link-l2attr')

module.exports = class L2Link extends Link {
  constructor (data, nwPath) {
    super(data, nwPath)
    const attrKey = 'ietf-l2-topology:l2-link-attributes' // alias
    this.attribute = new L2LinkAttribute(data[attrKey] || {}) // avoid undefined
  }
}
