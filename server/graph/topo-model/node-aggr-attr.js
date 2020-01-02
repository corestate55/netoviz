'use strict'

import TopoBaseContainer from './topo-base'

export default class AggregateNodeAttribute extends TopoBaseContainer {
  constructor(data) {
    super(data)
    this.class = 'AggregateNodeAttribute'
    this.aggregates = data.aggregates
  }

  _aggregatesNodeStr() {
    return this.aggregates
      .map(d => {
        const nameAttr = `data-name="${d.name}"`
        const pathAttr = `data-path="${d.path}"`
        return `<li><a ${nameAttr} ${pathAttr}>${d.name}</a></li>`
      })
      .join('')
  }

  toHtml() {
    return `<ul> ${this._aggregatesNodeStr()}</ul>`
  }
}
