'use strict'
/**
 * @file Definition of topology graph node.
 */

/**
 * Topology graph node class.
 */
class TopologyGraphNode {
  /**
   * Node data input.
   * @typedef {Object} NodeData
   * @prop {string} type
   * @prop {string} name
   * @prop {number} id
   * @prop {string} path
   * @prop {Array<string>} children
   * @prop {Array<string>} parents
   * @prop {Array<Object>} attribute
   * @prop {DiffState} diffState
   */
  /**
   * @typedef {NodeData|TopologyGraphNode} TopologyGraphNodeData
   */
  /**
   * @param {NodeData} nodeData
   */
  constructor(nodeData) {
    /** @type {string} */
    this.type = nodeData.type
    /** @type {string} */
    this.name = nodeData.name
    /** @type {number} */
    this.id = nodeData.id
    /** @type {string} */
    this.path = nodeData.path
    /** @type {Array<string>} */
    this.children = nodeData.children || [] // array of path(string)
    /** @type {Array<string>} */
    this.parents = nodeData.parents || [] // array of path(string)
    /** @type {Object} */
    this.attribute = nodeData.attribute || {}
    /** @type {DiffState} */
    this.diffState = nodeData.diffState || {}
  }

  /**
   * Add path as parent path.
   * @param {string} path - Additional path of parent.
   */
  addParent(path) {
    this.parents.push(path)
  }
}

export default TopologyGraphNode
