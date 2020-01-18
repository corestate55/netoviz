'use strict'
/**
 * @file Attribute class for layer3 link of topology model.
 */

import TopoBaseContainer from './topo-base'

/**
 * Attribute class for layer3 link.
 * @extends {TopoBaseContainer}
 */
class L3LinkAttribute extends TopoBaseContainer {
  /**
   * @typedef {Object} RfcL3LinkAttributeData
   * @prop {string} name
   * @prop {Array<string>} flag
   * @prop {number} metric1
   * @prop {number} metric2
   */
  /**
   * @param {RfcL3LinkAttributeData|L3LinkAttribute} data - L3 link attribute data.
   */
  constructor(data) {
    super(data)
    /** @type {string} */
    this.class = 'L3LinkAttribute'
    /** @type {string} */
    this.name = data.name || ''
    /** @type {Array<string>} */
    this.flag = data.flag || ''
    /** @type {number} */
    this.metric1 = data.metric1 || 100
    /** @type {number} */
    this.metric2 = data.metric2 || 100
  }
}

export default L3LinkAttribute
