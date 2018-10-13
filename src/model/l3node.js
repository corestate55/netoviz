'use strict'

const Node = require('./node')
const L3TermPoint = require('./l3term-point')
const L3NodeAttribute = require('./node-l3attr')

module.exports = class L3Node extends Node {
  constructor (data, nwPath, nwId, nodeNum) {
    super(data, nwPath, nwId, nodeNum)
    const attrKey = 'ietf-l3-unicast-topology:l3-node-attributes' // alias
    this.attribute = new L3NodeAttribute(data[attrKey] || {}) // avoid undefined
  }

  newTP (data, index) {
    return new L3TermPoint(data, this.path, this.id, index)
  }
}
