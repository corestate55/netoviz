/**
 * @file Definition of base class of node in dependency graph components.
 */

import DepGraphConstants from './constants'

/**
 * Base class of node in dependency graph components.
 * @extends {DepGraphConstants}
 */
class DepGraphNodeBase extends DepGraphConstants {
  /**
   * @param {TopologyGraphNodeData} graphData
   */
  constructor(graphData) {
    super()
    /** @type {string} */
    this.name = graphData.name
    /** @type {string} */
    this.path = graphData.path
    /** @type {string|null} */
    this.family = graphData.family || null
    /** @type {Array<string>} */
    this.children = graphData.children
    /** @type {Array<string>} */
    this.parents = graphData.parents
    /** @type {string} */
    this.type = graphData.type
    /** @type {Object} */
    this.attribute = graphData.attribute
    /** @type {DiffState} */
    this.diffState = graphData.diffState || {}
  }
}

export default DepGraphNodeBase
