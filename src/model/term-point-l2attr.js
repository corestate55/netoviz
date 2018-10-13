'use strict'

const TopoBaseContainer = require('./topo-base')

class VlanIdName extends TopoBaseContainer {
  constructor (data) {
    super(data)
    this.vlanId = data['vlan-id'] || data.vlanId
    this.vlanName = data['vlan-name'] || data.vlanName
  }

  toHtml () {
    return `
<span class="attr">VID:</span> ${this.vlanId},
<span class="attr">Name:</span> ${this.vlanName}
`
  }
}

module.exports = class L2TPAttribute extends TopoBaseContainer {
  // NOTICE: Attribute for type VLAN
  constructor (data) {
    super(data)
    this.class = 'L2TPAttribute'
    this.description = data.description || ''
    this.maxFrameSize = data['maximum-frame-size'] || data.maxFrameSize || 1500
    this.macAddr = data['mac-address'] || data.macAddr || 'xx:xx:xx:xx:xx:xx'
    this.ethEncap = data['eth-encapsulation'] || data.ethEncap || ''
    this.portVlanId = data['port-vlan-id'] || data.portVlanId || 0
    this.vlanIdName = []
    const vlanIdList = data['vlan-id-name'] || data.vlanIdName
    if (vlanIdList) {
      this.vlanIdName = vlanIdList.map(d => new VlanIdName(d))
    }
    this.tpState = data['tp-state'] || data.tpState || 'others'
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
