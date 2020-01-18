'use strict'
/**
 * @file Definition of layer3 link class of topology model.
 */

import RfcLink from './link'
import RfcL3LinkAttribute from './link-l3attr'

/**
 * Layer3 link class.
 * @extends {RfcLink}
 */
class RfcL3Link extends RfcLink {
  /**
   * @override
   */
  constructor(data, nwPath) {
    super(data, nwPath)
    const attrKey = 'ietf-l3-unicast-topology:l3-link-attributes' // alias
    /** @type {RfcL3LinkAttribute} */
    this.attribute = new RfcL3LinkAttribute(data[attrKey] || {}) // avoid undefined
  }
}

export default RfcL3Link
