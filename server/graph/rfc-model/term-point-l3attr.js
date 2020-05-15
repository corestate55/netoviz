/**
 * @file Attribute class for layer3 term-point of topology model.
 */
import RfcModelBase from './base'

/**
 * Attribute class for layer3 node.
 * @extends {RfcModelBase}
 */
class RfcL3TermPointAttribute extends RfcModelBase {
  /**
   * @typedef {Object} RfcL3TermPointAttributeData
   * @prop {Array<string>} ip-address
   */
  /**
   * @override
   * @param {RfcL3TermPointAttributeData|RfcL3TermPointAttribute} data - L3 node attribute data.
   */
  constructor(data) {
    super(data)
    /** @type {string} */
    this.class = 'RfcL3TermPointAttribute'
    /**
     * TODO: choice ip/unnumbered/interface-name (now use only ip).
     * @type {Array<string>}
     */
    this.ipAddress = data['ip-address'] || data.ipAddress || [] // notice: array
  }

  /**
   * Convert attribute to html string.
   * @returns {string} HTML string of attribute.
   * @public
   */
  toHtml() {
    return `
<ul>
 <li><span class="attr">IP Address:</span> ${this.ipAddress}</li>
</ul>
`
  }
}

export default RfcL3TermPointAttribute
