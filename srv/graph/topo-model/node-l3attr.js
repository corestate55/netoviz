'use strict'

import TopoBaseContainer from './topo-base'

class L3Prefix extends TopoBaseContainer {
  constructor (data) {
    super(data)
    this.prefix = data.prefix || ''
    this.metric = data.metric || 100
    this.flag = data.flag || [] // array
  }

  toHtml () {
    return `
<span class="attr">Prefix:</span> ${this.prefix},
<span class="attr">Metric:</span> ${this.metric},
<span class="attr">Flag:</span> ${this.flag}
`
  }
}

export default class L3NodeAttribute extends TopoBaseContainer {
  constructor (data) {
    super(data)
    this.class = 'L3NodeAttribute'
    this.name = data.name || ''
    this.flag = data.flag || ''
    this.routerId = data.routerId || [] // array
    this.prefix = [] // array
    if (data.prefix) {
      this.prefix = data.prefix.map(d => new L3Prefix(d))
    }
  }

  toHtml () {
    const prefixList = this.prefix.map(d => {
      return ['<li>', d.toHtml(), '</li>'].join('')
    })
    return `
<ul>
  <li><span class="attr">Name:</span> ${this.name}</li>
  <li><span class="attr">Flag:</span> ${this.flag}</li>
  <li><span class="attr">prefix:</span></li>
  <ul>${prefixList.join('')}</ul>
</ul>
`
  }
}
