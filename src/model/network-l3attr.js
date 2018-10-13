'use strict'

const TopoBaseContainer = require('./topo-base')

module.exports = class L3NetworkAttribute extends TopoBaseContainer {
  constructor (data) {
    super(data)
    this.class = 'L3NetworkAttribute'
    this.name = data.name || ''
    this.flag = data.flag || [] // list
  }
}
