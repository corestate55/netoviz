/**
 * @file Definition of constants for nested graph as base class.
 */

/**
 * Base class of nested graph.
 */
class NestedGraphConstants {
  constructor() {
    /**
     * X-padding of node rectangle.
     * @const
     * @type {number}
     */
    this.nodeXPad = 20
    /**
     * Y-padding of node rectangle.
     * @const
     * @type {number}
     */
    this.nodeYPad = 20
    /**
     * Radius of term-point circle.
     * @const
     * @type {number}
     */
    this.r = 10
    /**
     * Interval between term-points.
     * @const
     * @type {number}
     */
    this.tpInterval = 10
  }
}

export default NestedGraphConstants
