'use strict'

const TermPoint = require('./term-point')
const L3TPAttribute = require('./term-point-l3attr')

module.exports = class L3TermPoint extends TermPoint {
  constructor (data, nodePath, nodeId, tpNum) {
    super(data, nodePath, nodeId, tpNum)
    const attrKey = 'ietf-l3-unicast-topology:l3-termination-point-attributes' // alias
    this.attribute = new L3TPAttribute(data[attrKey] || {}) // avoid undefined
  }
}
