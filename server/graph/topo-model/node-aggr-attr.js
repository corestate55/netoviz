'use strict'
/**
 * @file Definition of aggregated node attribute.
 */

import TopoBaseContainer from './topo-base'

/**
 * Node attribute for aggregated node.
 * @extends {TopoBaseContainer}
 */
class AggregateNodeAttribute extends TopoBaseContainer {
  /**
   * @param {Object} data - Attribute data object.
   */
  constructor(data) {
    super(data)
    this.class = 'AggregateNodeAttribute'
    this.aggregates = data.aggregates
  }

  /**
   * Construct aggregated node string for HTML tooltip.
   * @returns {string}
   * @private
   */
  _aggregatesNodeStr() {
    return this.aggregates
      .map(d => {
        const nameAttr = `data-name="${d.name}"`
        const pathAttr = `data-path="${d.path}"`
        return `<li><a ${nameAttr} ${pathAttr}>${d.name}</a></li>`
      })
      .join('')
  }

  /**
   * Get HTML string of this attribute.
   * @returns {string} HTML string.
   */
  toHtml() {
    return `<ul> ${this._aggregatesNodeStr()}</ul>`
  }
}

export default AggregateNodeAttribute
