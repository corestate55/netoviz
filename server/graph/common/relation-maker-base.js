/**
 * @file Definition of relation-maker base.
 */

/**
 * Relationship of neighbor.
 */
class RelationMakerBase {
  /**
   * @param {Array<FSNode>} nodes - nodes which have parents/children.
   */
  constructor(nodes) {
    /** @type {boolean} */
    this.debugCalc = false
    /** @type {Array<FSNode>} */
    this.nodes = nodes
  }

  /**
   * Find node with its layer and name.
   * @param {string} targetNodeName - Name of target node.
   * @param {string} [targetNodeLayer] - Layer of target node.
   * @returns {FSNode} Found node.
   * @protected
   */
  findTargetNode(targetNodeName, targetNodeLayer) {
    this.consoleDebug(
      1,
      '_findTargetNode',
      `Search ${targetNodeLayer}__${targetNodeName}`
    )
    if (targetNodeLayer) {
      return this.findTargetNodeByPath(`${targetNodeLayer}__${targetNodeName}`)
    } else {
      return this.findTargetNodeByName(targetNodeName)
    }
  }

  /**
   * Find node with its name.
   * @param {string} name - Name of target node.
   * @returns {FSNode} Found node.
   * @protected
   */
  findTargetNodeByName(name) {
    return this.nodes.reverse().find(d => d.type === 'node' && d.name === name)
  }

  /**
   * Find node with its path.
   * @param {string} path - path of target node.
   * @returns {FSNode} Found node.
   * @protected
   */
  findTargetNodeByPath(path) {
    return this.nodes.find(d => d.path === path)
  }

  /**
   * Debug print for recursive operation.
   * @param {number} order - Order of recursive.
   * @param {string} pos - Position.
   * @param {string} message - Debug message.
   * @param {Object} [value] - Value to print.
   * @protected
   */
  consoleDebug(order, pos, message, value) {
    if (!this.debugCalc) {
      return
    }
    if (typeof value === 'undefined') {
      value = ''
    }
    const indent = ' '.repeat(order)
    console.log(`[${order}]${indent} * [${pos}] ${message}`, value)
  }
}

export default RelationMakerBase
