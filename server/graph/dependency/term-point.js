/**
 * @file Definition of dependency graph term-point.
 */

import ForceSimulationNode from '../force-simulation/node'
import DependencyConstants from './constants'

/**
 * Dependency graph term-point. (tp-type node)
 * @extends {ForceSimulationNode}
 */
class DependencyTermPoint extends ForceSimulationNode {
  /**
   * @param {ForceSimulationNodeData} nodeData - NodeData
   */
  constructor(nodeData) {
    super(nodeData)
    /** @type {DependencyConstants} */
    this.c = new DependencyConstants()
    /** @type {number} */
    this.index = nodeData.id % 100
  }

  /**
   * Set node position. (for circle)
   * @param {number} cx - X position of term-point circle.
   * @param {number} cy - Y position of term-point circle.
   * @private
   */
  _setCenterPosition(cx, cy) {
    this.cx = cx
    this.cy = cy
  }

  /**
   * Calculate and set position of term-point circle based on node position.
   * @param {number} nx - X position of node that contains this term-point.
   * @param {number} ny - Y position of node that contains this term-point.
   * @public
   */
  setCenterPosition(nx, ny) {
    this._setCenterPosition(this._calcX(nx), this._calcY(ny))
  }

  /**
   * Calculate x position of term-point.
   * @param {number} nx - X position of (parent) node.
   * @returns {number} X position of term-point.
   * @private
   */
  _calcX(nx) {
    return (
      nx +
      this.c.tpXPad1 +
      (2 * this.c.tpR + this.c.tpXPad2) * (this.index - 1) +
      this.c.tpR
    )
  }

  /**
   * Calculate y position of term-point
   * @param {number} ny - Y position of (parent) node.
   * @returns {number} Y position of term-point.
   * @private
   */
  _calcY(ny) {
    return ny + this.c.tpYPad1 + this.c.tpR
  }

  /**
   * Get parent path.
   * @returns {string} Parent path
   */
  parentPath() {
    const p = this.path.split('__')
    p.pop() // discard last element (tp name)
    return p.join('__')
  }

  /**
   * Convert to DependencyTermPointData.
   * @returns {DependencyTermPointData}
   */
  toData() {
    /**
     * @typedef {Object} DependencyTermPointData
     * @prop {number} number
     * @prop {number} cx
     * @prop {number} cy
     * @prop {number} r
     * @prop {string} name
     * @prop {string} path
     * @prop {string} type
     * @prop {Array<string>} parents
     * @prop {Array<string>} children
     * @prop {Object} attribute
     * @prop {DiffState} diffState
     */
    return {
      number: this.index,
      cx: this.cx,
      cy: this.cy,
      r: this.c.tpR,
      name: this.name,
      path: this.path,
      type: this.type,
      parents: this.parents,
      children: this.children,
      attribute: this.attribute,
      diffState: this.diffState
    }
  }
}

export default DependencyTermPoint
