'use strict'

const TopoBaseContainer = require('./topo-base')

module.exports = class L3LinkAttribute extends TopoBaseContainer {
  constructor (data) {
    super(data)
    this.class = 'L3LinkAttribute'
    this.name = data.name || ''
    this.flag = data.flag || ''
    this.metric1 = data.metric1 || 100
    this.metric2 = data.metric2 || 100
  }
}
