/**
 * @file Definition of dependency graph node.
 */

import ForceSimulationNode from '../force-simulation/node'
import DependencyConstants from './constants'

/**
 * Dependency graph node. (node-type node)
 * @extends {ForceSimulationNode}
 */
class DependencyNode extends ForceSimulationNode {
  /**
   * @param {ForceSimulationNodeData} nodeData - Node data.
   * @param {function} ownTermPointsCallback - Callback function
   *     to get term-points that this node contains.
   */
  constructor(nodeData, ownTermPointsCallback) {
    super(nodeData)
    /** @type {DependencyConstants} */
    this.c = new DependencyConstants()
    /** @type {number} */
    this.index = Math.floor((nodeData.id % 10000) / 100)
    /** @type {Array<ForceSimulationNodeData>} */
    this.ownTermPoints = ownTermPointsCallback(nodeData) // path list of ps in this node
  }

  /**
   * Set node position. (for rectangle)
   * @param {number} nx - X position of node.
   * @param {number} ny - Y position of node.
   * @public
   */
  setPosition(nx, ny) {
    /** @type {number} */
    this.x = nx
    /** @type {number} */
    this.y = ny
  }

  /**
   * Get (calculate) width of node
   * @returns {number} Width of node.
   * @public
   */
  nodeWidth() {
    return this.c.nodeWidth(this.ownTermPoints.length)
  }

  /**
   * Convert to DependencyNodeData.
   * @returns {DependencyNodeData}
   */
  toData() {
    /**
     * @typedef {Object} DependencyNodeData
     * @prop {number} number
     * @prop {number} x
     * @prop {number} y
     * @prop {number} width
     * @prop {number} height
     * @prop {string} name
     * @prop {string} path
     * @prop {string} type
     * @prop {FamilyRelation} family
     * @prop {Array<string>} parents
     * @prop {Array<string>} children
     * @prop {Object} attribute
     * @prop {DiffState} diffState
     */
    return {
      number: this.index,
      x: this.x,
      y: this.y,
      width: this.nodeWidth(),
      height: this.c.nodeHeight(),
      name: this.name,
      path: this.path,
      type: this.type,
      family: /** @type {FamilyRelation} */ this.family,
      parents: this.parents,
      children: this.children,
      attribute: this.attribute,
      diffState: this.diffState
    }
  }
}

export default DependencyNode
