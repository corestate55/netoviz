'use strict'

import TopoBaseContainer from './topo-base'

export default class L3NetworkAttribute extends TopoBaseContainer {
  constructor(data) {
    super(data)
    this.class = 'L3NetworkAttribute'
    this.name = data.name || ''
    this.flag = data.flag || [] // list
  }
}
