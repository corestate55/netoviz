/**
 * @file Attribute class for layer2 link of topology model.
 */

import RfcModelBase from './base'

/**
 * Attribute class for layer2 link.
 * @extends {RfcModelBase}
 */
class RfcL2LinkAttribute extends RfcModelBase {
  /**
   * @typedef {Object} RfcL2LinkAttributeData
   * @prop {string} name
   * @prop {Array<string>} flag
   * @prop {number} rate
   * @prop {number} delay
   * @prop {number} srlg
   */
  /**
   * @param {RfcL2LinkAttributeData|RfcL2LinkAttribute} data - L2 link attribute data.
   */
  constructor(data) {
    super(data)
    /** @type {string} */
    this.class = 'RfcL2LinkAttribute'
    /** @type {number} */
    this.name = data.name || ''
    /** @type {Array<string>} */
    this.flag = data.flag || []
    /** @type {number} */
    this.rate = data.rate || 100
    /** @type {number} */
    this.delay = data.delay || 0
    /** @type {number} */
    this.srlg = data.srlg || 0
  }
}

export default RfcL2LinkAttribute
