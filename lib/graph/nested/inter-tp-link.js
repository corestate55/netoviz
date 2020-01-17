/**
 * @file Definition of inter term-point link.
 */

import TopologyGraphLink from '~/server/graph/topo-graph/graph-link'

/**
 * Inter term-point link. (tp-tp type link)
 * @extends {TopologyGraphLink}
 */
class InterTpLink extends TopologyGraphLink {
  /**
   * @param {NestedGraphLinkData} link - Link of graph.
   * @param {NestedGraphNodeData} sourceTp - Source term-point of the link. (tp-type node)
   * @param {NestedGraphNodeData} targetTp - Destination term-point of the link. (tp-type node)
   */
  constructor(link, sourceTp, targetTp) {
    super(link)
    /**
     * @const
     * @type {number}
     */
    this.lineWidth = 2
    /** @type {number} */
    this.overlapIndex = -1
    /** @type {string} */
    this.sourcePath = sourceTp.path
    /** @type {string} */
    this.targetPath = targetTp.path
    /**
     * x of endpoint1
     * @type {number}
     */
    this.x1 = sourceTp.cx
    /**
     * y of endpoint1
     * @type {number}
     */
    this.y1 = sourceTp.cy
    /**
     * x of endpoint2
     * @type {number}
     */
    this.x2 = targetTp.cx
    /**
     * y of endpoint2
     * @type {number}
     */
    this.y2 = targetTp.cy
    /**
     * y of middle-point between endpoint1 and endpoint2
     * @type {number}
     */
    this.yMid = this._defaultYMiddlePoint()
  }

  /**
   * Lower x in endpoint1/2.
   * @returns {number}
   * @public
   */
  xMin() {
    return Math.min(this.x1, this.x2)
  }

  /**
   * Lower y in endpoint1/2.
   * @returns {number}
   * @public
   */
  yMin() {
    return Math.min(this.y1, this.y2)
  }

  /**
   * Higher x in endpoint1/2.
   * @returns {number}
   * @public
   */
  xMax() {
    return Math.max(this.x1, this.x2)
  }

  /**
   * Higher y in endpoint1/2.
   * @returns {number}
   * @public
   */
  yMax() {
    return Math.max(this.y1, this.y2)
  }

  /**
   * Link height.
   * @returns {number}
   * @private
   */
  _height() {
    return Math.abs(this.y2 - this.y1)
  }

  /**
   * Link width.
   * @returns {number}
   * @private
   */
  _width() {
    return Math.abs(this.x2 - this.x1)
  }

  /**
   * Check skew type is vertical.
   * @returns {boolean} True if vertical.
   * @public
   */
  isSkewVertical() {
    return this.x1 === this.x2
  }

  /**
   * Check skew type is horizontal.
   * @returns {boolean} True if horizontal.
   * @public
   */
  isSkewHorizontal() {
    return this.y1 === this.y2
  }

  /**
   * Check if 'slash' type line.
   * @returns {boolean} True if 'slash'.
   * @public
   */
  isSkewSlash() {
    return (
      (this.y1 > this.y2 && this.x1 < this.x2) ||
      (this.y1 < this.y2 && this.x1 > this.x2)
    )
  }

  /**
   * Check if 'backslash' type line
   * @returns {boolean} True if 'backslash'.
   * @public
   */
  isSkewBackslash() {
    return (
      (this.y1 > this.y2 && this.x1 > this.x2) ||
      (this.y1 < this.y2 && this.x1 < this.x2)
    )
  }

  /**
   * Get skew type of line.
   * <pre>
   *     3  |  4     quadrant
   *    ----+---->x  origin: [xMid, yMid]
   *     2  |  1
   *        y
   *   - 'slash': Quadrant 2-4
   *   - 'backslash': Quadrant 1-3
   * </pre>
   * @returns {string} Skew type.
   * @private
   */
  _skewType() {
    if (this.isSkewHorizontal()) {
      return 'horizontal'
    } else if (this.isSkewVertical()) {
      return 'vertical'
    } else if (this.isSkewSlash()) {
      return 'slash'
    } else if (this.isSkewBackslash()) {
      return 'backslash'
    }
  }

  /**
   * Check owns overlapIndex property.
   * @returns {boolean} True it has overlapIndex.
   * @public
   */
  hasOverlapIndex() {
    return this.overlapIndex >= 0
  }

  /**
   * Check the value is in range [s1, s2].
   * @param {number} value - Target value.
   * @param {number} s1 - Start of range.
   * @param {number} s2 - End of range.
   * @returns {boolean} True if value in range [s1, s2].
   * @private
   */
  _inRange(value, s1, s2) {
    return s1 <= value && value <= s2
  }

  /**
   * Check the x-position is in x-range of the link.
   * @param {number} xPosition - Target x.
   * @returns {boolean} True if xPosition is in x-range of link.
   * @private
   */
  _inRangeX(xPosition) {
    return this._inRange(xPosition, this.xMin(), this.xMax())
  }

  /**
   * Check the y-position is lower-half y-range of the link.
   * @param {number} yPosition - Target y.
   * @returns {boolean} True if yPosition is in lower-half y-range of link.
   * @private
   */
  _inRangeYLow(yPosition) {
    return this._inRange(yPosition, this.yMin(), this.yMid)
  }

  /**
   * Check the y-position is higher-half y-range of the link.
   * @param {number} yPosition - Target y.
   * @returns {boolean} True if yPosition is in higher-half y-range of link.
   * @private
   */
  _inRangeYHigh(yPosition) {
    return this._inRange(yPosition, this.yMid, this.yMax())
  }

  /**
   * y-mid point of other link is near of this y-mid.
   * @param {InterTpLink} otherLink - Other link.
   * @returns {boolean} Other link yMid is near of this yMid.
   * @private
   */
  _isNearYMid(otherLink) {
    const b = this.lineWidth * 3
    return this._inRange(otherLink.yMid, this.yMid - b, this.yMid + b)
  }

  /**
   * Check other-link and this link is overlapped.
   * <pre>
   *          b a     +-+===+-+
   *          a b     | |   | |
   *          | |     a b   b a
   *     +-+==+-+     b a   a b
   *     | |
   *     a b    a: this
   *     b a    b: other link
   * </pre>
   * @param {InterTpLink} otherLink - Other link.
   * @returns {boolean} True if overlap.
   * @public
   */
  isOverlapX(otherLink) {
    return (
      this._inRangeX(otherLink.xMin()) ||
      this._inRangeX(otherLink.xMax()) ||
      otherLink._inRangeX(this.xMin()) ||
      otherLink._inRangeX(this.xMax())
    )
  }

  /**
   * Other link and this link has same skew type.
   * @param {InterTpLink} otherLink - Other link.
   * @param {string} skewType - Skew type.
   * @returns {boolean} This and other link has same skew type.
   * @private
   */
  _isSameSkew(otherLink, skewType) {
    return (
      this._skewType() === otherLink._skewType() &&
      this._skewType() === skewType
    )
  }

  /**
   * Other and this links are backslash and overlapping pattern-A.
   * <pre>
   *            +----- a : this
   *         +--(-- b    : other link
   *         |  |
   *     a --(--+
   *  b -----+
   *               --->y
   * </pre>
   * @param {InterTpLink} otherLink - Other link.
   * @returns {boolean} True if links are backslash and overlapping-A.
   * @private
   */
  _isOverlapBackslashPatternA(otherLink) {
    return (
      this._inRangeYLow(otherLink.yMid) &&
      this._inRangeX(otherLink.xMax()) &&
      !this._inRangeX(otherLink.xMin())
    )
  }

  /**
   * Other and this links are backslash and overlapping pattern-B.
   * <pre>
   *            +----- b : other link
   *         +--(-- a    : this
   *         |  |
   *     b --(--+
   *  a -----+
   *               --->y
   * </pre>
   * @param {InterTpLink} otherLink - Other link.
   * @returns {boolean} True if links are backslash and overlapping-B.
   * @private
   */
  _isOverlapBackslashPatternB(otherLink) {
    return (
      this._inRangeYHigh(otherLink.yMid) &&
      this._inRangeX(otherLink.xMin()) &&
      !this._inRangeX(otherLink.xMax())
    )
  }

  /**
   * Other and this links are backslash and overlapping.
   * @param {InterTpLink} otherLink - Other link.
   * @returns {boolean} True if links are backslash and overlapping.
   * @private
   */
  _isOverlapBackslash(otherLink) {
    return (
      this._isSameSkew(otherLink, 'backslash') &&
      (this._isOverlapBackslashPatternA(otherLink) ||
        this._isOverlapBackslashPatternB(otherLink))
    )
  }

  /**
   * Other and this links are slash and overlapping pattern-A.
   * <pre>
   *  b -----+
   *     a --(--+
   *         |  |
   *         +--(-- b    : other link
   *            +----- a : this
   *               --->y
   * </pre>
   * @param {InterTpLink} otherLink - Other link.
   * @returns {boolean} True if links are slash and overlapping-A.
   * @private
   */
  _isOverlapSlashPatternA(otherLink) {
    return (
      this._inRangeYLow(otherLink.yMid) &&
      this._inRangeX(otherLink.xMin()) &&
      !this._inRangeX(otherLink.xMax())
    )
  }

  /**
   * Other and this links are slash and overlapping pattern-B.
   * <pre>
   *  a -----+
   *     b --(--+
   *         |  |
   *         +--(-- a    : this
   *            +----- b : other link
   *               --->y
   * </pre>
   * @param {InterTpLink} otherLink - Other link.
   * @returns {boolean} True if links are slash and overlapping-B.
   * @private
   */
  _isOverlapSlashPatternB(otherLink) {
    return (
      this._inRangeYHigh(otherLink.yMid) &&
      this._inRangeX(otherLink.xMax()) &&
      !this._inRangeX(otherLink.xMin())
    )
  }

  /**
   * Other and this links are slash and overlapping.
   * @param {InterTpLink} otherLink - Other link.
   * @returns {boolean} True if links are backslash and overlapping.
   * @private
   */
  _isOverlapSlash(otherLink) {
    return (
      this._isSameSkew(otherLink, 'slash') &&
      (this._isOverlapSlashPatternA(otherLink) ||
        this._isOverlapSlashPatternB(otherLink))
    )
  }

  /**
   * Other link is overlapping this link.
   * @param {InterTpLink} otherLink - Other link.
   * @returns {boolean} True if other is overlapping this.
   * @public
   */
  isOverlap(otherLink) {
    return (
      this.isOverlapX(otherLink) &&
      (this._isNearYMid(otherLink) ||
        this._isOverlapBackslash(otherLink) ||
        this._isOverlapSlash(otherLink))
    )
  }

  /**
   * Get default y-mid. (y of link middle point).
   * @returns {number} y of link middle point.
   * @private
   */
  _defaultYMiddlePoint() {
    let ym = this.y1 - 40 // default (if horizontal line)
    if (!this.isSkewHorizontal()) {
      ym = this._height() / 2 + this.yMin()
    }
    return ym
  }

  /**
   * Get default x-mid. (x of link middle point)
   * @returns {number} x of link middle point.
   */
  _xMiddlePoint() {
    return this._width() / 2 + this.xMin()
  }

  /**
   * Represent links as 3-point-coordinates.
   * @returns {Array<Array<number>>}
   * @public
   */
  represent3Points() {
    return [
      [this.x1, this.y1],
      [this._xMiddlePoint(), this.yMid],
      [this.x2, this.y2]
    ]
  }

  /**
   * Represent link as 4-point-coordinates.
   * for line generator (d3-shape package)
   * @returns {Array<Array<number>>}
   * @public
   */
  represent4Points() {
    return [
      [this.x1, this.y1],
      [this.x1, this.yMid],
      [this.x2, this.yMid],
      [this.x2, this.y2]
    ]
  }

  /**
   * SVG path of regular slash-type polyline. (circle-cornered)
   * @param {number} r - Radius of corner circle.
   * @returns {string} SVG path.
   * @private
   */
  _regularSlashPolyline(r) {
    return [
      `M${this.xMax()},${this.yMin()}`,
      `L${this.xMax()},${this.yMid - r}`,
      `A${r},${r} 0 0,1 ${this.xMax() - r},${this.yMid}`,
      `L${this.xMin() + r},${this.yMid}`,
      `A${r},${r} 0 0,0 ${this.xMin()},${this.yMid + r}`,
      `L${this.xMin()},${this.yMax()}`
    ].join(' ')
  }

  /**
   * SVG path of irregular slash-type polyline. (circle-cornered)
   * @param {number} r - Radius of corner circle.
   * @returns {string} SVG path.
   * @private
   */
  _irregularSlashPolyline(r) {
    return [
      `M${this.xMax()},${this.yMin()}`,
      `L${this.xMax()},${this.yMid - r}`,
      `A${r},${r} 0 0,1 ${this.xMax() - r},${this.yMid}`,
      `L${this.xMin() + r},${this.yMid}`,
      `A${r},${r} 0 0,1 ${this.xMin()},${this.yMid - r}`,
      `L${this.xMin()},${this.yMax()}`
    ].join(' ')
  }

  /**
   * SVG path of regular backslash-type polyline. (circle-cornered)
   * @param {number} r - Radius of corner circle.
   * @returns {string} SVG path.
   * @private
   */
  _regularBackslashPolyline(r) {
    return [
      `M${this.xMin()},${this.yMin()}`,
      `L${this.xMin()},${this.yMid - r}`,
      `A${r},${r} 0 0,0 ${this.xMin() + r},${this.yMid}`,
      `L${this.xMax() - r},${this.yMid}`,
      `A${r},${r} 0 0,1 ${this.xMax()},${this.yMid + r}`,
      `L${this.xMax()},${this.yMax()}`
    ].join(' ')
  }

  /**
   * SVG path of irregular backslash-type polyline. (circle-cornered)
   * @param {number} r - Radius of corner circle.
   * @returns {string} SVG path.
   * @private
   */
  _irregularBackslashPolyline(r) {
    return [
      `M${this.xMin()},${this.yMin()}`,
      `L${this.xMin()},${this.yMid - r}`,
      `A${r},${r} 0 0,0 ${this.xMin() + r},${this.yMid}`,
      `L${this.xMax() - r},${this.yMid}`,
      `A${r},${r} 0 0,0 ${this.xMax()},${this.yMid - r}`,
      `L${this.xMax()},${this.yMax()}`
    ].join(' ')
  }

  /**
   * SVG path of regular horizontal-type polyline. (circle-cornered)
   * @param {number} r - Radius of corner circle.
   * @returns {string} SVG path.
   * @private
   */
  _regularHorizontalPolyline(r) {
    return [
      `M${this.xMin()},${this.yMin()}`,
      `L${this.xMin()},${this.yMid + r}`,
      `A${r},${r} 0 0,1 ${this.xMin() + r},${this.yMid}`,
      `L${this.xMax() - r}, ${this.yMid}`,
      `A${r},${r} 0 0,1 ${this.xMax()},${this.yMid + r}`,
      `L${this.xMax()},${this.yMax()}`
    ].join(' ')
  }

  /**
   * SVG path of irregular horizontal-type polyline. (circle-cornered)
   * @param {number} r - Radius of corner circle.
   * @returns {string} SVG path.
   * @private
   */
  _irregularHorizontalPolyline(r) {
    return [
      `M${this.xMin()},${this.yMin()}`,
      `L${this.xMin()},${this.yMid - r}`,
      `A${r},${r} 0 0,0 ${this.xMin() + r},${this.yMid}`,
      `L${this.xMax() - r}, ${this.yMid}`,
      `A${r},${r} 0 0,0 ${this.xMax()},${this.yMid - r}`,
      `L${this.xMax()},${this.yMax()}`
    ].join(' ')
  }

  /**
   * Check if y-mid position. (after adjustment by overlap-group)
   * @returns {boolean} True if irregular y-mid. (dropped y-max)
   * @private
   */
  _isIrregularYMid() {
    return this.yMid > this.yMax()
  }

  /**
   * Get SVG path when link has enough width and able to use circled polyline.
   * @param {number} r - Radius of corner circle.
   * @returns {string} SVG path.
   * @private
   */
  _wideCircledCornerPolyline(r) {
    if (this.isSkewSlash()) {
      return this._isIrregularYMid()
        ? this._irregularSlashPolyline(r)
        : this._regularSlashPolyline(r)
    } else if (this.isSkewBackslash()) {
      return this._isIrregularYMid()
        ? this._irregularBackslashPolyline(r)
        : this._regularBackslashPolyline(r)
    }
    // horizontal
    return this._isIrregularYMid()
      ? this._irregularHorizontalPolyline(r)
      : this._regularHorizontalPolyline(r)
  }

  /**
   * Get SVG path when link does not have enough width, use line for corner.
   * @param {number} r - Radius of corner circle.
   * @returns {string} SVG path.
   * @private
   */
  _narrowCircledCornerPolyline(r) {
    if (this.isSkewSlash()) {
      return [
        `M${this.xMax()},${this.yMin()}`,
        `L${this.xMax()},${this.yMid - r}`,
        `L${this.xMin()},${this.yMid + r}`,
        `L${this.xMin()},${this.yMax()}`
      ].join(' ')
    } else if (this.isSkewBackslash()) {
      return [
        `M${this.xMin()},${this.yMin()}`,
        `L${this.xMin()},${this.yMid - r}`,
        `L${this.xMax()},${this.yMid + r}`,
        `L${this.xMax()},${this.yMax()}`
      ].join(' ')
    }
    // horizontal
    return [
      `M${this.xMin()},${this.yMin()}`,
      `L${this.xMin()},${this.yMid}`,
      `L${this.xMax()},${this.yMid}`,
      `L${this.xMax()},${this.yMax()}`
    ].join(' ')
  }

  /**
   * Get SVG path of link. (circled-corner-polyline)
   * @returns {string} SVG path.
   * @public
   */
  circledCornerPolyline() {
    // corner radius (MUST be smaller than term-point circle radius)
    const r = 10
    // exception
    if (this.isSkewVertical()) {
      return [
        `M${this.xMin()},${this.yMin()}`,
        `L${this.xMax()},${this.yMax()}`
      ].join(' ')
    }
    // When narrow width polyline,
    // it approximate using straight line instead of curved section.
    // Narrow height case is ignored,
    // because term-point circle will hide corner-circle.
    // (if tp circle radius >= corner circle radius)
    if (this._width() >= r * 2) {
      return this._wideCircledCornerPolyline(r)
    }
    return this._narrowCircledCornerPolyline(r)
  }
}

export default InterTpLink
