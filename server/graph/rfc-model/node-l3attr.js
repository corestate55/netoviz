/**
 * @file Attribute class for layer3 node of topology model.
 */

import RfcModelBase from './base'

/**
 * L3 prefix class.
 * @extends {RfcModelBase}
 */
class RfcL3Prefix extends RfcModelBase {
  /**
   * @typedef {Object} RfcL3NodePrefixData
   * @prop {string} prefix
   * @prop {number} metric
   * @prop {Array<string>} flag
   */
  /**
   * @param {RfcL3NodePrefixData|RfcL3Prefix} data - Prefix data for L3 node.
   */
  constructor(data) {
    super(data)
    /** @type {string} */
    this.prefix = data.prefix || ''
    /** @type {number} */
    this.metric = data.metric || 0
    /** @type {Array<string>} */
    this.flag = data.flag || [] // array
  }

  /**
   * Convert attribute to html string.
   * @returns {string} HTML string of attribute.
   * @public
   */
  toHtml() {
    return `
<span class="attr">Prefix:</span> ${this.prefix},
<span class="attr">Metric:</span> ${this.metric},
<span class="attr">Flag:</span> ${this.flag}
`
  }
}

/**
 * Attribute class for layer3 node.
 * @extends {RfcModelBase}
 */
class RfcL3NodeAttribute extends RfcModelBase {
  /**
   * @typedef {Object} RfcL3NodeAttributeData
   * @prop {string} name
   * @prop {Array<string>} flag
   * @prop {Array<string>} router-id
   * @prop {Array<RfcL3Prefix>} prefix
   */
  /**
   * @param {RfcL3NodeAttributeData|RfcL3NodeAttribute} data - L3 node attribute data.
   */
  constructor(data) {
    super(data)
    /** @type {string} */
    this.class = 'RfcL3NodeAttribute'
    /** @type {string} */
    this.name = data.name || ''
    /** @type {Array<string>} */
    this.flag = data.flag || []
    /** @type {Array<string>} */
    this.routerId = this._selectRouterId(data)
    /** @type {Array<RfcL3Prefix>} */
    this.prefix = [] // array
    if (data.prefix) {
      this.prefix = data.prefix.map((d) => new RfcL3Prefix(d))
    }
  }

  /**
   * Get router-id of layer3 node attribute.
   * @param {RfcL3NodeAttributeData|RfcL3NodeAttribute} data - L3 node attribute data.
   * @returns {Array<string>} List of router-id.
   * @private
   */
  _selectRouterId(data) {
    if ('router-id' in data) {
      return data['router-id'] // RFC8345-json
    } else if ('routerId' in data) {
      return data.routerId // converted data for topology graph
    }
    return [] // array
  }

  /**
   * Convert attribute to html string.
   * @returns {string} HTML string of attribute.
   * @public
   */
  toHtml() {
    const prefixList = this.prefix.map((d) => {
      return ['<li>', d.toHtml(), '</li>'].join('')
    })
    return `
<ul>
  <li><span class="attr">Name:</span> ${this.name}</li>
  <li><span class="attr">Router ID:</span> ${this.routerId}</li>
  <li><span class="attr">Flag:</span> ${this.flag}</li>
  <li><span class="attr">prefix:</span></li>
  <ul>${prefixList.join('')}</ul>
</ul>
`
  }
}

export default RfcL3NodeAttribute
