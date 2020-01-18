'use strict'
/**
 * @file Definition of aggregated node attribute.
 */

import TopoBaseContainer from './topo-base'

/**
 * Node attribute for aggregated node.
 * @see {AggregatedNestedGraphNode}
 * @extends {TopoBaseContainer}
 */
class AggregatedNodeAttribute extends TopoBaseContainer {
  /**
   * @typedef {Object} AggregatedNodePath
   * @prop {string} name
   * @prop {string} path
   */
  /**
   * @typedef {Object} AggregatedNodeAttributeData
   * @prop {Array<AggregatedNodePath>} aggregates
   */
  /**
   * @param {AggregatedNodeAttributeData} data - Aggregated node attribute data.
   */
  constructor(data) {
    super(data)
    /** @type {string} */
    this.class = 'AggregatedNodeAttribute'
    /** @type {Array<AggregatedNodePath>} */
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
   * Convert attribute to html string.
   * @returns {string} HTML string of attribute.
   * @public
   */
  toHtml() {
    return `<ul> ${this._aggregatesNodeStr()}</ul>`
  }
}

export default AggregatedNodeAttribute
