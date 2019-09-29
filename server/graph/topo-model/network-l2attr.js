'use strict'

import TopoBaseContainer from './topo-base'

export default class L2NetworkAttribute extends TopoBaseContainer {
  constructor(data) {
    super(data)
    this.class = 'L2NetworkAttribute'
    this.name = data.name || ''
    this.flag = data.flag || [] // list
  }
}
