'use strict'

const Network = require('./network')
const L2Node = require('./l2node')
const L2Link = require('./l2link')
const L2NetworkAttribute = require('./network-l2attr')

module.exports = class L2Network extends Network {
  constructor (data, nwNum) {
    super(data, nwNum)
    const attrKey = 'ietf-l2-topology:l2-topology-attributes'
    this.attribute = new L2NetworkAttribute(data[attrKey] || {}) // avoid undefined
  }

  newNode (data, index) {
    return new L2Node(data, this.path, this.id, index)
  }

  newLink (data) {
    return new L2Link(data, this.path)
  }
}
