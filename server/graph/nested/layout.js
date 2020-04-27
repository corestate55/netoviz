/**
 * @file Definition of Layout data for nested graph.
 */

/**
 * Nested graph layout
 */
class NestLayout {
  /**
   * @typedef {Object} ViewLayoutData
   * @prop {GridPositions|{}} grid - Grid positions.
   * @prop {Object|{}} layout - Root-node-path and {@link OrdinalPosition} dictionary.
   * @see {GridOperator}
   */
  /**
   * @typedef {Object} LayoutData
   * @prop {ViewLayoutData} standard - Top (standard) view layout data.
   * @prop {ViewLayoutData} reverse - Bottom view layout data.
   */
  /**
   * @param {boolean} reverse - Flag for top/bottom view selection.
   * @param {LayoutData} layoutData - Layout data.
   * @see {TopologyDataREST}
   */
  constructor(reverse, layoutData) {
    /** @type {boolean} */
    this.reverse = reverse
    /** @type {Object|null} */
    this.layoutData = layoutData || null
  }

  /**
   * Convert layout data to data object.
   * @returns {null|ViewLayoutData} Layout data.
   * @public
   */
  toData() {
    if (this.layoutData) {
      if (this.reverse && this.layoutData?.reverse) {
        return this.layoutData.reverse
      } else if (!this.reverse && this.layoutData?.standard) {
        return this.layoutData.standard
      }
    }
    return null
  }
}

export default NestLayout
