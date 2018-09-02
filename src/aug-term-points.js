'use strict'

import {TopoBaseContainer} from './base'
import {TermPoint} from './term-point'

class VlanIdName extends TopoBaseContainer {
  constructor (data) {
    super(data)
    this.vlanId = data['vlan-id']
    this.vlanName = data['vlan-name']
  }

  toHtml () {
    return `
<span class="attr">VID:</span> ${this.vlanId},
<span class="attr">Name:</span> ${this.vlanName}
`
  }
}

class L2TPAttribute extends TopoBaseContainer {
  // NOTICE: Attribute for type VLAN
  constructor (data) {
    super(data)
    this.description = data.description || ''
    this.maxFrameSize = data['maximum-frame-size'] || 1500
    this.macAddr = data['mac-address'] || 'xx:xx:xx:xx:xx:xx'
    this.ethEncap = data['eth-encapsulation'] || ''
    this.portVlanId = data['port-vlan-id'] || 0
    this.vlanIdName = []
    if (data['vlan-id-name']) {
      this.vlanIdName = data['vlan-id-name'].map(d => new VlanIdName(d))
    }
    this.tpState = data['tp-state'] || 'others'
  }

  toHtml () {
    const portIdNameStr = this.vlanIdName.map(
      d => `<li>${d.toHtml()}</li>`
    )
    return `
<ul>
  <li><span class="attr">Description:</span> ${this.description}</li>
  <li><span class="attr">Maximum Frame Size:</span> ${this.maxFrameSize}</li>
  <li><span class="attr">Mac Address:</span> ${this.macAddr}</li>
  <li><span class="attr">Ether Encapsulation:</span> ${this.ethEncap}</li>
  <li><span class="attr">Port VLAN ID:</span> ${this.portVlanId}</li>
  <li><span class="attr">Vlan ID/Name:</span></li>
    <ul>${portIdNameStr.join('')}</ul>
  <li><span class="attr">TP State:</span> ${this.tpState}</li>
</ul>
`
  }
}

export class L2TermPoint extends TermPoint {
  constructor (data, nodePath, nodeId, tpNum) {
    super(data, nodePath, nodeId, tpNum)
    const attrKey = 'ietf-l2-topology:l2-termination-point-attributes' // alias
    this.attribute = new L2TPAttribute(data[attrKey] || {}) // avoid undefined
  }
}

class L3TPAttribute extends TopoBaseContainer {
  constructor (data) {
    super(data)
    // TODO: choice ip/unnumbered/interface-name,
    // but, now use only ip
    this.ipAddress = data['ip-address'] || [] // notice: array
  }

  toHtml () {
    return `
<ul>
 <li><span class="attr">IP Address:</span> ${this.ipAddress}</li>
</ul>
`
  }
}

export class L3TermPoint extends TermPoint {
  constructor (data, nodePath, nodeId, tpNum) {
    super(data, nodePath, nodeId, tpNum)
    const attrKey = 'ietf-l3-unicast-topology:l3-termination-point-attributes' // alias
    this.attribute = new L3TPAttribute(data[attrKey] || {}) // avoid undefined
  }
}
