/**
 * Definition of Grid operator.
 */

import NestLayout from './layout'

/**
 * Grid operator.
 */
class GridOperator {
  /**
   * @param {boolean} reverse - Flag for top/bottom view selection.
   * @param {LayoutData} layoutData - Layout data.
   */
  constructor(reverse, layoutData) {
    this._setLayoutData(reverse, layoutData)
    /** @type {number} */
    this.currentX = 0
    /** @type {number} */
    this.currentY = 0
  }

  /**
   * Set grids from layout data.
   * @param {boolean} reverse - Flag for top/bottom view selection.
   * @param {LayoutData} layoutData - Layout data.
   * @private
   */
  _setLayoutData(reverse, layoutData) {
    const layout = new NestLayout(reverse, layoutData)
    /** @type {ViewLayoutData} */
    this.layoutData = layout.toData()
    if (this.layoutData) {
      this._setXYGrid()
    } else {
      this.layoutData = { layout: {}, grid: {} } // empty data
      this._initDefault(4, 10, 200)
    }
  }

  /**
   * Set X/Y grid position.
   * @private
   */
  _setXYGrid() {
    /** @type {Array<number>} */
    this.xGrids = this.layoutData.grid.x
    /** @type {Array<number>} */
    this.yGrids = this.layoutData.grid.y
  }

  /**
   * Initialize default grids.
   * @param {number} ni - Ordinal number of x.
   * @param {number} nj - Ordinal number of y.
   * @param {number} interval - Interval between grids.
   * @private
   */
  _initDefault(ni, nj, interval) {
    this._setXGridByInterval(ni, interval)
    this._setYGridByInterval(nj, interval)
  }

  /**
   * Set xGrids.
   * @param {number} ni - Ordinal Number of x.
   * @param {number} interval - Interval between grids.
   * @private
   */
  _setXGridByInterval(ni, interval) {
    this.xGrids = []
    for (let i = 0; i < ni; i++) {
      this.xGrids.push((i + 1) * interval)
    }
  }

  /**
   * Set yGrids.
   * @param {number} nj - Ordinal number of y.
   * @param {number} interval - Interval between grids.
   * @private
   */
  _setYGridByInterval(nj, interval) {
    this.yGrids = []
    for (let j = 0; j < nj; j++) {
      this.yGrids.push((j + 1) * interval)
    }
  }

  /**
   * Get position in ordinal-coordination.
   * @param {OrdinalPosition} ordinalPosition - Ordinal position.
   * @returns {CoordinatePosition} Coordinate position.
   * @public
   */
  positionByOrdinal(ordinalPosition) {
    return this._ordinal2coordinate(ordinalPosition.i, ordinalPosition.j)
  }

  /**
   * Convert ordinal position to coordinate position
   * @param i
   * @param j
   * @returns {CoordinatePosition}
   * @private
   */
  _ordinal2coordinate(i, j) {
    // TODO: range error check
    /** @typedef {{x: number, y: number}} CoordinatePosition */
    return { x: this.xGrids[i], y: this.yGrids[j] }
  }

  /**
   * Get next ordinal position.
   * @returns {OrdinalPosition} Ordinal position.
   * @private
   */
  _nextOrdinalPosition() {
    const i = this.currentX
    const j = this.currentY
    // set next
    this.currentX = (i + 1) % this.xGrids.length
    if (this.currentX === 0) {
      this.currentY = (j + 1) % this.yGrids.length
    }
    /** @typedef {{i: number, j: number}} OrdinalPosition */
    return { i, j } // current
  }

  /**
   * Get ordinal position of node (node attached grid).
   * @param {string} path - Node path.
   * @returns {OrdinalPosition}
   * @public
   */
  ordinalPositionByNodePath(path) {
    const ordinalPosition = this.layoutData.layout[path]
    if (ordinalPosition) {
      return ordinalPosition
    }
    return this._nextOrdinalPosition()
  }

  /**
   * Convert grid operator to grid data object.
   * @returns {GridPositions} Grid positions.
   * @public
   */
  toData() {
    /**
     * @typedef {{x: Array<number>, y: Array<number>}} GridPositions
     */
    return { x: this.xGrids, y: this.yGrids }
  }
}

export default GridOperator
