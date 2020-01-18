'use strict'
/**
 * @file Definition of topology graph node.
 */

/**
 * Topology graph node class.
 */
class ForceSimulationNode {
  /**
   * Node data input.
   * @typedef {Object} NodeData
   * @prop {string} type - Type of node.
   * @prop {string} name - Name of node.
   * @prop {number} id - ID of node (for force-simulation).
   * @prop {string} path - Path of node.
   * @prop {Array<string>} children - Children paths.
   * @prop {Array<string>} parents - Parents paths.
   * @prop {Array<Object>} attribute - Attribute of node.
   * @prop {DiffState} diffState - State of diff.
   */
  /**
   * @typedef {NodeData|ForceSimulationNode} ForceSimulationNodeData
   */
  /**
   * @param {ForceSimulationNodeData} nodeData - Node data.
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

export default ForceSimulationNode
