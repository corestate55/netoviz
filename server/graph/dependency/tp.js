/**
 * @file Definition of dependency graph term-point.
 */

import DepGraphNodeBase from './base'

/**
 * Dependency graph term-point. (tp-type node)
 * @extends {DepGraphNodeBase}
 */
class DepGraphTp extends DepGraphNodeBase {
  /**
   * @param {TopologyGraphNodeData} graphData - NodeData
   */
  constructor(graphData) {
    super(graphData)
    /** @type {number} */
    this.number = graphData.id % 100
  }

  /**
   * Set node position. (for circle)
   * @param {number} cx - X position of term-point circle.
   * @param {number} cy - Y position of term-point circle.
   * @public
   */
  setCenterPos(cx, cy) {
    this.cx = cx
    this.cy = cy
  }

  /**
   * Calculate (and set) position of term-point circle based on node position.
   * @param {number} nx - X position of node that contains this term-point.
   * @param {number} ny - Y position of node that contains this term-point.
   * @public
   */
  calcCenterPos(nx, ny) {
    this.setCenterPos(this._calcX(nx), this._calcY(ny))
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
      this.tpXPad1 +
      (2 * this.tpR + this.tpXPad2) * (this.number - 1) +
      this.tpR
    )
  }

  /**
   * Calculate y position of term-point
   * @param {number} ny - Y position of (parent) node.
   * @returns {number} Y position of term-point.
   * @private
   */
  _calcY(ny) {
    return ny + this.tpYPad1 + this.tpR
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
   * Convert to DependencyGraphTermPointData.
   * @returns {DependencyGraphTermPointData}
   */
  toData() {
    /**
     * @typedef {Object} DependencyGraphTermPointData
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
      number: this.number,
      cx: this.cx,
      cy: this.cy,
      r: this.tpR,
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

export default DepGraphTp
