'use strict'

import {L3TermPoint, L2TermPoint} from './aug-term-points'
import {Node} from './node'

class L2NodeAttribute {
  constructor (data) {
    this.name = data.name || ''
    this.description = data.description || ''
    this.mgmtAddr = data['management-address'] || [] // ip addr list
    this.sysMacAddr = data['sys-mac-address'] || 'zz:zz:zz:zz:zz:zz'
    this.mgmtVid = data['management-vid'] || 1
    this.flag = data.flag || [] // list
  }

  toHtml () {
    var mgmtIpStr = this.mgmtAddr.map(d => '<li>' + d + '</li>')
    return `
<ul>
  <li>Name: ${this.name}</li>
  <li>Description: ${this.description}</li>
  <li>Management IP: </li>
    <ul>${mgmtIpStr.join('')}</ul>
  <li>Management VID: ${this.mgmtVid}</li>
  <li>Flag: ${this.flag}</li>
`
  }
}

export class L2Node extends Node {
  constructor (data, nwPath, nwId, nodeNum) {
    super(data, nwPath, nwId, nodeNum)
    let attrKey = 'ietf-l2-topology:l2-node-attributes' // alias
    this.attribute = new L2NodeAttribute(data[attrKey] || {}) // avoid undefined
  }

  newTP (data, index) {
    return new L2TermPoint(data, this.path, this.id, index)
  }
}

class L3Prefix {
  constructor (data) {
    this.prefix = data.prefix || ''
    this.metric = data.metric || 100
    this.flag = data.flag || [] // array
  }

  toString () {
    return [
      'Prefix:' + this.prefix,
      'Metric:' + this.metric,
      'Flag:' + this.flag
    ].join(', ')
  }
}

class L3NodeAttribute {
  constructor (data) {
    this.name = data.name || ''
    this.flag = data.flag || ''
    this.routerId = data.routerId || [] // array
    this.prefix = [] // array
    if (data.prefix) {
      this.prefix = data.prefix.map(d => new L3Prefix(d))
    }
  }

  toHtml () {
    var prefixList = this.prefix.map(d => {
      return ['<li>', d.toString(), '</li>'].join('')
    })
    return `
<ul>
  <li>Name: ${this.name}</li>
  <li>Flag: ${this.flag}</li>
  <li>prefix:</li>
  <ul>${prefixList.join('')}</ul>
</ul>
`
  }
}

export class L3Node extends Node {
  constructor (data, nwPath, nwId, nodeNum) {
    super(data, nwPath, nwId, nodeNum)
    let attrKey = 'ietf-l3-unicast-topology:l3-node-attributes' // alias
    this.attribute = new L3NodeAttribute(data[attrKey] || {}) // avoid undefined
  }

  newTP (data, index) {
    return new L3TermPoint(data, this.path, this.id, index)
  }
}
