/**
 * @file Definition of Link for nested graph.
 */

/**
 * Link for nested graph.
 */
class NestedGraphLink {
  /**
   * @param {Object} linkData - Link data.
   */
  constructor(linkData) {
    /** @type {string} */
    this.name = linkData.name
    /** @type {string} */
    this.path = linkData.path
    /** @type {string} */
    this.type = linkData.type
    /** @type {string} */
    this.sourcePath = linkData.sourcePath
    /** @type {string} */
    this.targetPath = linkData.targetPath
    /** @type {number} */
    this.sourceId = linkData.sourceId
    /** @type {number} */
    this.targetId = linkData.targetId
    /** @type {Object} */
    this.attribute = linkData.attribute
    /** @type {Object} */
    this.diffState = linkData.diffState
  }

  /**
   * Check link is inter specified nodes.
   * @param {Array<ShallowNestedGraphNode>} nodes - Nodes.
   * @returns {boolean} True if this link connects specified nodes.
   */
  availableIn(nodes) {
    if (this.type === 'node-tp') {
      return false // do not use node-tp type link in Nested Graph
    }
    const source = nodes.find(d => d.path === this.sourcePath)
    const target = nodes.find(d => d.path === this.targetPath)
    return Boolean(source && target)
  }
}

export default NestedGraphLink
