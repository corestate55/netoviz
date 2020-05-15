/**
 * @file Attribute class for layer2 network of topology model.
 */

import RfcModelBase from './base'

/**
 * Attribute class for layer2 network.
 * @extends {RfcModelBase}
 */
class RfcL2NetworkAttribute extends RfcModelBase {
  /**
   * @typedef {Object} RfcL2NetworkAttributeData
   * @prop {string} name
   * @prop {Array<string>} flag
   */
  /**
   * @param {RfcL2NetworkAttributeData|RfcL2NetworkAttribute} data - L2 network attribute data.
   */
  constructor(data) {
    super(data)
    /** @type {string} */
    this.class = 'RfcL2NetworkAttribute'
    /** @type {string} */
    this.name = data.name || ''
    /** @type {Array<string>} */
    this.flag = data.flag || []
  }
}

export default RfcL2NetworkAttribute
