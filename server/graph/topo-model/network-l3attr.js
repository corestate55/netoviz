'use strict'
/**
 * @file Attribute class for layer3 network of topology model.
 */

import TopoBaseContainer from './topo-base'

/**
 * Attribute class for layer3 network.
 * @extends {TopoBaseContainer}
 */
class L3NetworkAttribute extends TopoBaseContainer {
  /**
   * @typedef {Object} RfcL3NetworkAttributeData
   * @prop {string} name
   * @prop {Array<string>} flag
   */
  /**
   * @param {RfcL3NetworkAttributeData|L3NetworkAttribute} data
   */
  constructor(data) {
    super(data)
    /**  @type {string} */
    this.class = 'L3NetworkAttribute'
    /**  @type {string} */
    this.name = data.name || ''
    /**  @type {Array<string>} */
    this.flag = data.flag || []
  }
}

export default L3NetworkAttribute
