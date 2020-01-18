'use strict'
/**
 * @file Definition of layer3 link class of topology model.
 */

import Link from './link'
import L3LinkAttribute from './link-l3attr'

/**
 * Layer3 link class.
 * @extends {Link}
 */
class L3Link extends Link {
  /**
   * @override
   */
  constructor(data, nwPath) {
    super(data, nwPath)
    const attrKey = 'ietf-l3-unicast-topology:l3-link-attributes' // alias
    /** @type {L3LinkAttribute} */
    this.attribute = new L3LinkAttribute(data[attrKey] || {}) // avoid undefined
  }
}

export default L3Link
