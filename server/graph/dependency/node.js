/**
 * @file Definition of dependency graph node.
 */
import DepGraphNodeBase from './base'

/**
 * Dependency graph node. (node-type node)
 * @extends {DepGraphNodeBase}
 */
class DepGraphNode extends DepGraphNodeBase {
  /**
   * @param {TopologyGraphNodeData} graphData - Node data.
   * @param tpListCB
   */
  constructor(graphData, tpListCB) {
    super(graphData)
    /** @type {number} */
    this.number = Math.floor((graphData.id % 10000) / 100)
    /** @type {Array} */
    this.tpList = tpListCB(graphData) // path list of tps in this node
  }

  /**
   * Set node position. (for rectangle)
   * @param {number} nx - X position of node.
   * @param {number} ny - Y position of node.
   * @public
   */
  setPos(nx, ny) {
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
    const numOfTp = this.tpList.length > 0 ? this.tpList.length : 1 // minimum size
    return (
      this.tpXPad1 * 2 + 2 * this.tpR * numOfTp + this.tpXPad2 * (numOfTp - 1)
    )
  }

  /**
   * Convert to DependencyGraphNodeData.
   * @returns {DependencyGraphNodeData}
   */
  toData() {
    /**
     * @typedef {Object} DependencyGraphNodeData
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
      number: this.number,
      x: this.x,
      y: this.y,
      width: this.nodeWidth(),
      height: this.nodeHeight(),
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

export default DepGraphNode
