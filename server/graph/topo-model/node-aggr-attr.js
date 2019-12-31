'use strict'

import TopoBaseContainer from './topo-base'

export default class AggregateNodeAttribute extends TopoBaseContainer {
  constructor(data) {
    super(data)
    this.class = 'AggregateNodeAttribute'
    this.aggregates = data.aggregates
  }

  _aggregatesNodeStr() {
    return this.aggregates.map(d => `<li>${d.path}</li>`).join('')
  }

  toHtml() {
    return `<ul> ${this._aggregatesNodeStr()}</ul>`
  }
}
