'use strict'
/**
 * @file Attribute class for layer2 network of topology model.
 */

import TopoBaseContainer from './topo-base'

/**
 * Attribute class for layer2 network.
 * @extends {TopoBaseContainer}
 */
class L2NetworkAttribute extends TopoBaseContainer {
  /**
   * @typedef {Object} RfcL2NetworkAttributeData
   * @prop {string} name
   * @prop {Array<string>} flag
   */
  /**
   * @param {RfcL2NetworkAttributeData|L2NetworkAttribute} data - L2 network attribute data.
   */
  constructor(data) {
    super(data)
    /**  @type {string} */
    this.class = 'L2NetworkAttribute'
    /**  @type {string} */
    this.name = data.name || ''
    /**  @type {Array<string>} */
    this.flag = data.flag || []
  }
}

export default L2NetworkAttribute
