'use strict'

const Network = require('./network')
const L3Node = require('./l3node')
const L3Link = require('./l3link')
const L3NetworkAttribute = require('./network-l3attr')

module.exports = class L3Network extends Network {
  constructor (data, nwNum) {
    super(data, nwNum)
    const attrKey = 'ietf-l3-unicast-topology:l3-topology-attributes'
    this.attribute = new L3NetworkAttribute(data[attrKey] || {}) // avoid undefined
  }

  newNode (data, index) {
    return new L3Node(data, this.path, this.id, index)
  }

  newLink (data) {
    return new L3Link(data, this.path)
  }
}
