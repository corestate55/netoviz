/**
 * @file Definition of Layout data for nested graph.
 */

/**
 * Nested graph layout
 */
class NestLayout {
  /**
   * @param {boolean} reverse - Flag for top/bottom view selection.
   * @param {LayoutData} layoutData - Layout data.
   * @see {@link TopologyDataAPI}
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
    /**
     * @typedef {{layout: {Object}, grid: {Object}}} ViewLayoutData
     * LayoutData = { reverse: ViewLayoutData, standard: ViewLayoutData}
     */
    if (this.layoutData) {
      if (this.reverse && 'reverse' in this.layoutData) {
        return this.layoutData.reverse
      } else if (!this.reverse && 'standard' in this.layoutData) {
        return this.layoutData.standard
      }
    }
    return null
  }
}

export default NestLayout
