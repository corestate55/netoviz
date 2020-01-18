'use strict'
/**
 * @file Definition of layer2 link class of topology model.
 */

import Link from './link'
import L2LinkAttribute from './link-l2attr'

/**
 * Layer2 link class.
 * @extends {Link}
 */
class L2Link extends Link {
  /**
   * @override
   */
  constructor(data, nwPath) {
    super(data, nwPath)
    const attrKey = 'ietf-l2-topology:l2-link-attributes' // alias
    /** @type {L2LinkAttribute} */
    this.attribute = new L2LinkAttribute(data[attrKey] || {}) // avoid undefined
  }
}

export default L2Link
