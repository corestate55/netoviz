'use strict'

const TopoBaseContainer = require('./topo-base')

module.exports = class L2NetworkAttribute extends TopoBaseContainer {
  constructor (data) {
    super(data)
    this.class = 'L2NetworkAttribute'
    this.name = data.name || ''
    this.flag = data.flag || [] // list
  }
}
