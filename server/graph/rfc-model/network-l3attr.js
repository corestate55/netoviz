/**
 * @file Attribute class for layer3 network of topology model.
 */

import RfcModelBase from './base'

/**
 * Attribute class for layer3 network.
 * @extends {RfcModelBase}
 */
class RfcL3NetworkAttribute extends RfcModelBase {
  /**
   * @typedef {Object} RfcL3NetworkAttributeData
   * @prop {string} name
   * @prop {Array<string>} flag
   */
  /**
   * @param {RfcL3NetworkAttributeData|RfcL3NetworkAttribute} data
   */
  constructor(data) {
    super(data)
    /** @type {string} */
    this.class = 'RfcL3NetworkAttribute'
    /** @type {string} */
    this.name = data.name || ''
    /** @type {Array<string>} */
    this.flag = data.flag || []
  }
}

export default RfcL3NetworkAttribute
