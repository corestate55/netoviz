'use strict'

import TopoBaseContainer from './topo-base'

export default class L2LinkAttribute extends TopoBaseContainer {
  constructor (data) {
    super(data)
    this.class = 'L2LinkAttribute'
    this.name = data.name || ''
    this.flag = data.flag || ''
    this.rate = data.rate || 100
    this.delay = data.delay || 0
    this.srlg = data.srlg || 0
  }
}
