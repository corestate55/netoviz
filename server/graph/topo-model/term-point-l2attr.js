'use strict'
/**
 * @file Attribute class for layer2 term-point of topology model.
 */

import TopoBaseContainer from './topo-base'

/**
 * VLAN ID/Name class.
 * @extends {TopoBaseContainer}
 */
class VlanIdName extends TopoBaseContainer {
  /**
   * @typedef {Object} RfcL2TermPointVlanIdNameData
   * @prop {number} vlan-id
   * @prop {string} vlan-name
   */
  /**
   * @param {RfcL2TermPointVlanIdNameData|VlanIdName} data
   */
  constructor(data) {
    super(data)
    /** @type {number} */
    this.vlanId = data['vlan-id'] || data.vlanId
    /** @type {string} */
    this.vlanName = data['vlan-name'] || data.vlanName
  }

  /**
   * Convert attribute to html string.
   * @returns {string} HTML string of attribute.
   * @public
   */
  toHtml() {
    return `
<span class="attr">VID:</span> ${this.vlanId},
<span class="attr">Name:</span> ${this.vlanName}
`
  }
}

/**
 * Attribute class for Layer2 term-point.
 * (NOTICE: This is an attribute for attribute-type:VLAN)
 * @extends {TopoBaseContainer}
 */
class L2TPAttribute extends TopoBaseContainer {
  /**
   * @typedef {Object} RfcL2TermPointAttributeData
   * @prop {string} description
   * @prop {number} maximum-frame-size
   * @prop {string} mac-address
   * @prop {string} eth-encapsulation
   * @prop {number} port-vlan-id
   * @prop {Array<VlanIdName>} vlan-id-name
   * @prop {string} tp-state
   */
  /**
   * @param {RfcL2TermPointAttributeData|L2TPAttribute} data - L2 term-point attribute data.
   */
  constructor(data) {
    super(data)
    /**  @type {string} */
    this.class = 'L2TPAttribute'
    /**  @type {string} */
    this.description = data.description || ''
    /**  @type {number} */
    this.maxFrameSize = data['maximum-frame-size'] || data.maxFrameSize || 1500
    /**  @type {string} */
    this.macAddr = data['mac-address'] || data.macAddr || 'xx:xx:xx:xx:xx:xx'
    /**  @type {string} */
    this.ethEncap = data['eth-encapsulation'] || data.ethEncap || ''
    /**  @type {number} */
    this.portVlanId = data['port-vlan-id'] || data.portVlanId || 0
    /**  @type {Array<VlanIdName>} */
    this.vlanIdName = []
    const vlanIdList = data['vlan-id-name'] || data.vlanIdName
    if (vlanIdList) {
      this.vlanIdName = vlanIdList.map(d => new VlanIdName(d))
    }
    /**  @type {string} */
    this.tpState = data['tp-state'] || data.tpState || 'others'
  }

  /**
   * Convert attribute to html string.
   * @see {TooltipCreator}
   * @returns {string} HTML string of attribute.
   * @public
   */
  toHtml() {
    const portIdNameStr = this.vlanIdName.map(d => `<li>${d.toHtml()}</li>`)
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

export default L2TPAttribute
