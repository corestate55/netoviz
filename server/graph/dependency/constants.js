/**
 * @file Definition of constants of dependency graph as base class.
 */

/**
 * Constants of dependency graph.
 */
class DependencyConstants {
  constructor() {
    // term-point
    /**
     * @const
     * @type {number}
     */
    this.tpR = 20
    /**
     * @const
     * @type {number}
     */
    this.tpXPad1 = 12
    /**
     * @const
     * @type {number}
     */
    this.tpXPad2 = 12
    /**
     * @const
     * @type {number}
     */
    this.tpYPad1 = 12
    /**
     * @const
     * @type {number}
     */
    this.tpYPad2 = 24

    // node
    /**
     * @const
     * @type {number}
     */
    this.nodeXPad1 = 15
    /**
     * @const
     * @type {number}
     */
    this.nodeXPad2 = 15
    /**
     * @const
     * @type {number}
     */
    this.nodeYPad1 = 15
    /**
     * @const
     * @type {number}
     */
    this.nodeYPad2 = 24

    // layer
    /**
     * @const
     * @type {number}
     */
    this.layerXPad1 = 100
    /**
     * @const
     * @type {number}
     */
    this.layerYPad1 = 50
    /**
     * @const
     * @type {number}
     */
    this.layerYPad2 = 30
  }

  /**
   * Get (calculate) width of node
   * @param {number} tpLength - Length of term-points in node.
   * @returns {number} Width of node.
   * @public
   */
  nodeWidth(tpLength) {
    const length = tpLength > 0 ? tpLength : 1 // minimum size
    return (
      this.tpXPad1 * 2 + 2 * this.tpR * length + this.tpXPad2 * (length - 1)
    )
  }

  /**
   * Get height of node.
   * @returns {number} Height of node.
   * @public
   */
  nodeHeight() {
    return this.tpYPad1 + 2 * this.tpR + this.tpYPad2 // fixed value
  }
}

export default DependencyConstants
