'use strict'

const Node = require('./node')
const L2TermPoint = require('./l2term-point')
const L2NodeAttribute = require('./node-l2attr')

module.exports = class L2Node extends Node {
  constructor (data, nwPath, nwId, nodeNum) {
    super(data, nwPath, nwId, nodeNum)
    const attrKey = 'ietf-l2-topology:l2-node-attributes' // alias
    this.attribute = new L2NodeAttribute(data[attrKey] || {}) // avoid undefined
  }

  newTP (data, index) {
    return new L2TermPoint(data, this.path, this.id, index)
  }
}
