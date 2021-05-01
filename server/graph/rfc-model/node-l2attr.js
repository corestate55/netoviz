/**
 * @file Attribute class for layer2 node of topology model.
 */
import RfcModelBase from './base'

/**
 * Attribute class for layer2 node.
 * @extends {RfcModelBase}
 */
class RfcL2NodeAttribute extends RfcModelBase {
  /**
   * @typedef {Object} RfcL2NodeAttributeData
   * @prop {string} name
   * @prop {string} description
   * @prop {Array<string>} management-address
   * @prop {string} sys-mac-address
   * @prop {number} management-vid
   * @prop {Array<string>} flag
   */
  /**
   * @param {RfcL2NodeAttributeData|RfcL2NodeAttribute} data - L2 node attribute data.
   */
  constructor(data) {
    super(data)
    /** @type {string} */
    this.class = 'RfcL2NodeAttribute'
    /** @type {string} */
    this.name = data.name || ''
    /** @type {string} */
    this.description = data.description || ''
    /**
     * List of IP address.
     * @type {Array<string>}
     */
    this.mgmtAddr = data['management-address'] || data.mgmtAddr || []
    /** @type {string} */
    this.sysMacAddr =
      data['sys-mac-address'] || data.sysMacAddr || 'zz:zz:zz:zz:zz:zz'
    /** @type {number} */
    this.mgmtVid = data['management-vid'] || data.mgmtVid || 1
    /** @type {Array<string>} */
    this.flag = data.flag || [] // list
  }

  /**
   * Convert attribute to html string.
   * @returns {string} HTML string of attribute.
   * @public
   */
  toHtml() {
    const mgmtIpStr = this.mgmtAddr.map((d) => `<li>${d}</li>`)
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

export default RfcL2NodeAttribute
