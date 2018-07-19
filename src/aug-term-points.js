'use strict'

import {TermPoint} from './term-points'

class VlanIdName {
  constructor (data) {
    this.vlanid = data['vlan-id']
    this.vlanName = data['vlan-name']
  }

  toString () {
    return [
      'VLAN-ID:' + this.vlanId, 'VLAN-Name:' + this.vlanName
    ].join(',')
  }
}

class L2TPAttribute {
  // NOTICE: Attribute for type VLAN
  constructor (data) {
    this.description = data.description || ''
    this.maxFrameSize = data['maximum-frame-size'] || 1500
    this.macAddr = data['mac-address'] || 'xx:xx:xx:xx:xx:xx'
    this.ethEncap = data['eth-encapsulation'] || ''
    this.portVlanId = data['port-vlan-id'] || 1
    this.vlanIdName = []
    if (data['vlan-id-name']) {
      this.vlanIdName = data['vlan-id-name'].map(d => new VlanIdName(d))
    }
    this.tpState = data['tp-state'] || 'others'
  }

  toHtml () {
    var portIdNameStr = this.vlanIdName.map(
      d => '<li>' + d.toString() + '</li>'
    )
    return `
<ul>
  <li>Description: ${this.description}</li>
  <li>Maximum Frame Size: ${this.maxFrameSize}</li>
  <li>Mac Address: ${this.macAddr}</li>
  <li>Ether Encapsulation: ${this.ethEncap}</li>
  <li>Port VLAN ID: ${this.portVlanId}</li>
  <li>Vlan ID/Name:</li>
    <ul>${portIdNameStr}</ul>
  <li>TP State: ${this.tpState}</li>
</ul>
`
  }
}

export class L2TermPoint extends TermPoint {
  constructor (data, nodePath, nodeId, tpNum) {
    super(data, nodePath, nodeId, tpNum)
    let attrKey = 'ietf-l2-topology:l2-termination-point-attributes' // alias
    this.attribute = new L2TPAttribute(data[attrKey] || {}) // avoid undefined
  }
}

class L3TPAttribute {
  constructor (data) {
    // TODO: choice ip/unnumbered/interface-name,
    // but, now use only ip
    this.ipAddress = data['ip-address'] || [] // notice: array
  }

  toHtml () {
    return `
<ul>
 <li>IP Address: ${this.ipAddress}</li>
</ul>
`
  }
}

export class L3TermPoint extends TermPoint {
  constructor (data, nodePath, nodeId, tpNum) {
    super(data, nodePath, nodeId, tpNum)
    let attrKey = 'ietf-l3-unicast-topology:l3-termination-point-attributes' // alias
    this.attribute = new L3TPAttribute(data[attrKey] || {}) // avoid undefined
  }
}
