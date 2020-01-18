'use strict'
/**
 * @file Definition of layer2 link class of topology model.
 */

import RfcLink from './link'
import RfcL2LinkAttribute from './link-l2attr'

/**
 * Layer2 link class.
 * @extends {RfcLink}
 */
class RfcL2Link extends RfcLink {
  /**
   * @override
   */
  constructor(data, nwPath) {
    super(data, nwPath)
    const attrKey = 'ietf-l2-topology:l2-link-attributes' // alias
    /** @type {RfcL2LinkAttribute} */
    this.attribute = new RfcL2LinkAttribute(data[attrKey] || {}) // avoid undefined
  }
}

export default RfcL2Link
