'use strict'

import { TopoBaseContainer } from './base'
import { L3TermPoint, L2TermPoint } from './aug-term-points'
import { Node } from './node'

class L2NodeAttribute extends TopoBaseContainer {
  constructor (data) {
    super(data)
    this.name = data.name || ''
    this.description = data.description || ''
    this.mgmtAddr = data['management-address'] || [] // ip addr list
    this.sysMacAddr = data['sys-mac-address'] || 'zz:zz:zz:zz:zz:zz'
    this.mgmtVid = data['management-vid'] || 1
    this.flag = data.flag || [] // list
  }

  toHtml () {
    const mgmtIpStr = this.mgmtAddr.map(d => `<li>${d}</li>`)
    return `
<ul>
  <li><span class="attr">Name:</span> ${this.name}</li>
  <li><span class="attr">Description:</span> ${this.description}</li>
  <li><span class="attr">Management IP:</span></li>
    <ul>${mgmtIpStr.join('')}</ul>
  <li><span class="attr">Management VID:</span> ${this.mgmtVid}</li>
  <li><span class="attr">Flag:</span> ${this.flag}</li>
`
  }
}

export class L2Node extends Node {
  constructor (data, nwPath, nwId, nodeNum) {
    super(data, nwPath, nwId, nodeNum)
    const attrKey = 'ietf-l2-topology:l2-node-attributes' // alias
    this.attribute = new L2NodeAttribute(data[attrKey] || {}) // avoid undefined
  }

  newTP (data, index) {
    return new L2TermPoint(data, this.path, this.id, index)
  }
}

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

class L3NodeAttribute extends TopoBaseContainer {
  constructor (data) {
    super(data)
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

export class L3Node extends Node {
  constructor (data, nwPath, nwId, nodeNum) {
    super(data, nwPath, nwId, nodeNum)
    const attrKey = 'ietf-l3-unicast-topology:l3-node-attributes' // alias
    this.attribute = new L3NodeAttribute(data[attrKey] || {}) // avoid undefined
  }

  newTP (data, index) {
    return new L3TermPoint(data, this.path, this.id, index)
  }
}
