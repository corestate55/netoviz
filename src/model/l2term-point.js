'use strict'

const TermPoint = require('./term-point')
const L2TPAttribute = require('./term-point-l2attr')

module.exports = class L2TermPoint extends TermPoint {
  constructor (data, nodePath, nodeId, tpNum) {
    super(data, nodePath, nodeId, tpNum)
    const attrKey = 'ietf-l2-topology:l2-termination-point-attributes' // alias
    this.attribute = new L2TPAttribute(data[attrKey] || {}) // avoid undefined
  }
}
