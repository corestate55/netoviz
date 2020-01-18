'use strict'
/**
 * @file Attribute class for layer3 term-point of topology model.
 */
import TopoBaseContainer from './topo-base'

/**
 * Attribute class for layer3 node.
 * @extends {TopoBaseContainer}
 */
class L3TPAttribute extends TopoBaseContainer {
  /**
   * @typedef {Object} RfcL3TermPointAttributeData
   * @prop {Array<string>} ip-address
   */
  /**
   * @override
   * @param {RfcL3TermPointAttributeData|L3TPAttribute} data - L3 node attribute data.
   */
  constructor(data) {
    super(data)
    /** @type {string} */
    this.class = 'L3TPAttribute'
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

export default L3TPAttribute
