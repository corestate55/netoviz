'use strict'
/**
 * @file Attribute class for layer2 link of topology model.
 */

import TopoBaseContainer from './topo-base'

/**
 * Attribute class for layer2 link.
 * @extends {TopoBaseContainer}
 */
class L2LinkAttribute extends TopoBaseContainer {
  /**
   * @typedef {Object} RfcL2LinkAttributeData
   * @prop {string} name
   * @prop {Array<string>} flag
   * @prop {number} rate
   * @prop {number} delay
   * @prop {number} srlg
   */
  /**
   * @param {RfcL2LinkAttributeData|L2LinkAttribute} data - L2 link attribute data.
   */
  constructor(data) {
    super(data)
    /** @type {string} */
    this.class = 'L2LinkAttribute'
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

export default L2LinkAttribute
