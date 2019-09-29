class InterTpLink {
  constructor(link, sourceTp, targetTp) {
    this.lineWidth = 2 // constant
    this.overlapIndex = -1
    this.type = link.type
    this.path = link.path
    this.name = link.name
    this.sourcePath = sourceTp.path
    this.targetPath = targetTp.path
    this.x1 = sourceTp.cx
    this.y1 = sourceTp.cy
    this.x2 = targetTp.cx
    this.y2 = targetTp.cy
    this.yMid = this.yMiddlePoint()
    this.diffState = link.diffState || {}
    this.attribute = link.attribute || {}
  }

  xMin() {
    return Math.min(this.x1, this.x2)
  }

  yMin() {
    return Math.min(this.y1, this.y2)
  }

  xMax() {
    return Math.max(this.x1, this.x2)
  }

  yMax() {
    return Math.max(this.y1, this.y2)
  }

  height() {
    return Math.abs(this.y2 - this.y1)
  }

  width() {
    return Math.abs(this.x2 - this.x1)
  }

  onQuadrant24() {
    return (
      (this.y1 > this.y2 && this.x1 < this.x2) ||
      (this.y1 < this.y2 && this.x1 > this.x2)
    )
  }

  onQuadrant13() {
    return (
      (this.y1 > this.y2 && this.x1 > this.x2) ||
      (this.y1 < this.y2 && this.x1 < this.x2)
    )
  }

  skewType() {
    //    3  |  4     quadrant
    //   ----+---->x  origin: [xMid, yMid]
    //    2  |  1
    //       y
    if (this.y1 === this.y2) {
      return 'horizontal'
    } else if (this.x1 === this.x2) {
      return 'vertical'
    } else if (this.onQuadrant24()) {
      return 'slash'
    } else if (this.onQuadrant13()) {
      return 'backslash'
    }
  }

  isSkewHorizontal() {
    return this.skewType() === 'horizontal'
  }

  isSkewSlash() {
    return this.skewType() === 'slash'
  }

  hasOverlapIndex() {
    return this.overlapIndex >= 0
  }

  inRange(val, s1, s2) {
    return s1 <= val && val <= s2
  }

  inRangeX(val, link) {
    if (!link) {
      link = this
    }
    return this.inRange(val, link.xMin(), link.xMax())
  }

  inRangeYLow(val, link) {
    if (!link) {
      link = this
    }
    return this.inRange(val, link.yMin(), link.yMid)
  }

  inRangeYHigh(val, link) {
    if (!link) {
      link = this
    }
    return this.inRange(val, link.yMid, link.yMax())
  }

  isNearYMid(link) {
    if (!link) {
      link = this
    }
    const b = this.lineWidth * 3
    return this.inRange(link.yMid, this.yMid - b, this.yMid + b)
  }

  isOverlapX(link) {
    //         b a     +-+===+-+
    //         a b     | |   | |
    //         | |     a b   b a
    //    +-+==+-+     b a   a b
    //    | |
    //    a b    a: this
    //    b a    b: other link
    if (!link) {
      link = this
    }
    return (
      this.inRangeX(link.xMin()) ||
      this.inRangeX(link.xMax()) ||
      link.inRangeX(this.xMin()) ||
      link.inRangeX(this.xMax())
    )
  }

  isSameSkew(link, type) {
    return this.skewType() === link.skewType() && this.skewType() === type
  }

  isCrossingBackslashPatternA(link) {
    //           +----- a : this
    //        +--(-- b    : other link
    //        |  |
    //    a --(--+
    // b -----+
    //              --->y
    return (
      this.inRangeYLow(link.yMid) &&
      this.inRangeX(link.xMax()) &&
      !this.inRangeX(link.xMin())
    )
  }

  isCrossingBackslashPatternB(link) {
    //           +----- b : other link
    //        +--(-- a    : this
    //        |  |
    //    b --(--+
    // a -----+
    //              --->y
    return (
      this.inRangeYHigh(link.yMid) &&
      this.inRangeX(link.xMin()) &&
      !this.inRangeX(link.xMax())
    )
  }

  isCrossingBackslash(link) {
    return (
      this.isSameSkew(link, 'backslash') &&
      (this.isCrossingBackslashPatternA(link) ||
        this.isCrossingBackslashPatternB(link))
    )
  }

  isCrossingSlashPatternA(link) {
    // b -----+
    //    a --(--+
    //        |  |
    //        +--(-- b    : other link
    //           +----- a : this
    //              --->y
    return (
      this.inRangeYLow(link.yMid) &&
      this.inRangeX(link.xMin()) &&
      !this.inRangeX(link.xMax())
    )
  }

  isCrossingSlashPatternB(link) {
    // a -----+
    //    b --(--+
    //        |  |
    //        +--(-- a    : this
    //           +----- b : other link
    //              --->y
    return (
      this.inRangeYHigh(link.yMid) &&
      this.inRangeX(link.xMax()) &&
      !this.inRangeX(link.xMin())
    )
  }

  isCrossingSlash(link) {
    return (
      this.isSameSkew(link, 'slash') &&
      (this.isCrossingSlashPatternA(link) || this.isCrossingSlashPatternB(link))
    )
  }

  isOverlap(link) {
    return (
      this.isOverlapX(link) &&
      (this.isNearYMid(link) ||
        this.isCrossingBackslash(link) ||
        this.isCrossingSlash(link))
    )
  }

  yMiddlePoint() {
    let ym = this.y1 - 40 // default (if horizontal line)
    if (!this.isSkewHorizontal()) {
      ym = this.height() / 2 + this.yMin()
    }
    return ym
  }

  xMiddlePoint() {
    return this.width() / 2 + this.xMin()
  }

  represent3Points() {
    return [
      [this.x1, this.y1],
      [this.xMiddlePoint(), this.yMid],
      [this.x2, this.y2]
    ]
  }

  // for line generator (d3-shape package)
  represent4Points() {
    return [
      [this.x1, this.y1],
      [this.x1, this.yMid],
      [this.x2, this.yMid],
      [this.x2, this.y2]
    ]
  }

  _wideCircledCornerPolyline(r) {
    if (this.skewType() === 'slash') {
      return [
        `M${this.xMax()},${this.yMin()}`,
        `L${this.xMax()},${this.yMid - r}`,
        `A${r},${r} 0 0,1 ${this.xMax() - r},${this.yMid}`,
        `L${this.xMin() + r},${this.yMid}`,
        `A${r},${r} 0 0,0 ${this.xMin()},${this.yMid + r}`,
        `L${this.xMin()},${this.yMax()}`
      ].join(' ')
    } else if (this.skewType() === 'backslash') {
      return [
        `M${this.xMin()},${this.yMin()}`,
        `L${this.xMin()},${this.yMid - r}`,
        `A${r},${r} 0 0,0 ${this.xMin() + r},${this.yMid}`,
        `L${this.xMax() - r},${this.yMid}`,
        `A${r},${r} 0 0,1 ${this.xMax()},${this.yMid + r}`,
        `L${this.xMax()},${this.yMax()}`
      ].join(' ')
    }
    // horizontal
    return [
      `M${this.xMin()},${this.yMin()}`,
      `L${this.xMin()},${this.yMid + r}`,
      `A${r},${r} 0 0,1 ${this.xMin() + r},${this.yMid}`,
      `L${this.xMax() - r}, ${this.yMid}`,
      `A${r},${r} 0 0,1 ${this.xMax()},${this.yMid + r}`,
      `L${this.xMax()},${this.yMax()}`
    ].join(' ')
  }

  _narrowCircledCornerPolyline(r) {
    if (this.skewType() === 'slash') {
      return [
        `M${this.xMax()},${this.yMin()}`,
        `L${this.xMax()},${this.yMid - r}`,
        `L${this.xMin()},${this.yMid + r}`,
        `L${this.xMin()},${this.yMax()}`
      ].join(' ')
    } else if (this.skewType() === 'backslash') {
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

  circledCornerPolyline() {
    // corner radius (MUST be smaller than term-point circle radius)
    const r = 10
    // exception
    if (this.skewType() === 'vertical') {
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
    if (this.width() >= r * 2) {
      return this._wideCircledCornerPolyline(r)
    }
    return this._narrowCircledCornerPolyline(r)
  }
}

export default class InterTpLinkCreator {
  constructor(graphData) {
    const findNodeByPath = (nodes, path) => {
      return nodes.find(tp => tp.path === path)
    }
    this.links = graphData.links.map(link => {
      const sourceTp = findNodeByPath(graphData.nodes, link.sourcePath)
      const targetTp = findNodeByPath(graphData.nodes, link.targetPath)
      return new InterTpLink(link, sourceTp, targetTp)
    })
    this.checkLineOverlap()
    this.feedbackLineOverlap()
  }

  _forEachTpTpLink(startIndex, callback) {
    for (let i = startIndex; i < this.links.length; i++) {
      // Overlapping check is necessary for each 'tp-tp' type links,
      // except 'support-tp' links.
      if (this.links[i].type === 'support-tp') {
        continue // ignore support-tp link
      }
      callback(i, this.links[i])
    }
  }

  checkLineOverlap() {
    let overlapIndex = 0
    const overwriteIndex = {}

    // To set overlapIndex for last entry, counter:i must loop at last.
    this._forEachTpTpLink(0, (i, linkI) => {
      let oi = overlapIndex
      if (linkI.hasOverlapIndex()) {
        oi = linkI.overlapIndex
      } else {
        linkI.overlapIndex = overlapIndex
        overlapIndex++
      }
      this._forEachTpTpLink(i + 1, (j, linkJ) => {
        if (linkI.isOverlap(linkJ)) {
          if (linkJ.hasOverlapIndex() && oi !== linkJ.overlapIndex) {
            overwriteIndex[oi] = linkJ.overlapIndex
          }
          linkJ.overlapIndex = oi
        }
      })
    })
    // integrate indirect overlapped links
    this.links.forEach(link => {
      if (link.overlapIndex in overwriteIndex) {
        link.overlapIndex = overwriteIndex[link.overlapIndex]
      }
    })
  }

  slashLinks(overlappedLinks) {
    //         a b
    //         | |
    //  +------+ |
    //  | +------+
    //  | |   sequence of slash type link
    //  a b   (a -> b)
    return overlappedLinks
      .filter(link => link.isSkewSlash())
      .sort((a, b) => (a.xMax() < b.xMax() ? -1 : 1))
  }

  backslashLinks(overlappedLinks) {
    //  b a   sequence of backslash type link
    //  | |   (a -> b)
    //  | +------+           +------+   sequence of
    //  +------+ |           | +--+ |   horizontal link
    //         | |           | |  | |   (without crossing)
    //         b a           a b  b a   (a -> b)
    return overlappedLinks
      .filter(link => !link.isSkewSlash()) // backslash, horizontal, vertical
      .sort((a, b) => (a.xMax() < b.xMax() ? 1 : -1))
  }

  setYMidOfLinksIn(overlappedLinks) {
    const slashLinks = this.slashLinks(overlappedLinks)
    const backslashLinks = this.backslashLinks(overlappedLinks)
    const links = slashLinks.concat(backslashLinks)

    const yMidBase =
      links.map(link => link.yMid).reduce((sum, val) => sum + val) /
      links.length // average of yMid
    let yMidOffset = 0

    for (const [i, link] of links.entries()) {
      if (i > 0 && link.isOverlapX(links[i - 1])) {
        //    i-1    i i+1
        //     |     |  |
        //  *--+  +--+  | <--- align yMid
        //  | +---(-----*
        //  | |   |
        // link[i-1] and link[i] are not overlapped
        // but same group because they have same overlapped link.
        yMidOffset += link.lineWidth * 3
      }
      link.yMid = yMidBase + yMidOffset
    }
  }

  feedbackLineOverlap() {
    const uniqOverlapIndex = new Set(this.links.map(link => link.overlapIndex))
    for (const oi of Array.from(uniqOverlapIndex)) {
      const overlappedLinks = this.linksWith('overlapIndex', oi)
      if (overlappedLinks.length <= 1) {
        continue
      }
      this.setYMidOfLinksIn(overlappedLinks)
    }
  }

  linksWith(attribute, value) {
    return this.links.filter(link => link[attribute] === value)
  }

  supportTpLinks() {
    return this.linksWith('type', 'support-tp')
  }

  tpTpLinks() {
    return this.linksWith('type', 'tp-tp')
  }

  toData() {
    return this.links
  }
}
