class InterTpLink {
  constructor (link, sourceTp, targetTp) {
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
  }

  xMin () {
    return Math.min(this.x1, this.x2)
  }

  yMin () {
    return Math.min(this.y1, this.y2)
  }

  xMax () {
    return Math.max(this.x1, this.x2)
  }

  yMax () {
    return Math.max(this.y1, this.y2)
  }

  height () {
    return Math.abs(this.y2 - this.y1)
  }

  onQuadrant24 () {
    return (this.y1 > this.y2 && this.x1 < this.x2) ||
      (this.y1 < this.y2 && this.x1 > this.x2)
  }

  onQuadrant13 () {
    return (this.y1 > this.y2 && this.x1 > this.x2) ||
      (this.y1 < this.y2 && this.x1 < this.x2)
  }

  skewType () {
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

  isSkewHorizontal () {
    return this.skewType() === 'horizontal'
  }

  isSkewSlash () {
    return this.skewType() === 'slash'
  }

  hasOverlapIndex () {
    return this.overlapIndex >= 0
  }

  inRange (val, s1, s2) {
    return (s1 <= val) && (val <= s2)
  }

  inRangeX (val, link) {
    if (!link) {
      link = this
    }
    return this.inRange(val, link.xMin(), link.xMax())
  }

  inRangeYLow (val, link) {
    if (!link) {
      link = this
    }
    return this.inRange(val, link.yMin(), link.yMid)
  }

  inRangeYHigh (val, link) {
    if (!link) {
      link = this
    }
    return this.inRange(val, link.yMid, link.yMax())
  }

  isNearYMid (link) {
    if (!link) {
      link = this
    }
    const b = this.lineWidth * 3
    return this.inRange(link.yMid, this.yMid - b, this.yMid + b)
  }

  isOverlapX (link) {
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
    return this.inRangeX(link.xMin()) || this.inRangeX(link.xMax()) ||
      link.inRangeX(this.xMin()) || link.inRangeX(this.xMax())
  }

  isSameSkew (link, type) {
    return this.skewType() === link.skewType() &&
      this.skewType() === type
  }

  isCrossingBackslashPatternA (link) {
    //           +----- a : this
    //        +--(-- b    : other link
    //        |  |
    //    a --(--+
    // b -----+
    //              --->y
    return this.inRangeYLow(link.yMid) &&
      this.inRangeX(link.xMax()) && !this.inRangeX(link.xMin())
  }

  isCrossingBackslashPatternB (link) {
    //           +----- b : other link
    //        +--(-- a    : this
    //        |  |
    //    b --(--+
    // a -----+
    //              --->y
    return this.inRangeYHigh(link.yMid) &&
      this.inRangeX(link.xMin()) && !this.inRangeX(link.xMax())
  }

  isCrossingBackslash (link) {
    return this.isSameSkew(link, 'backslash') &&
      (
        this.isCrossingBackslashPatternA(link) ||
        this.isCrossingBackslashPatternB(link)
      )
  }

  isCrossingSlashPatternA (link) {
    // b -----+
    //    a --(--+
    //        |  |
    //        +--(-- b    : other link
    //           +----- a : this
    //              --->y
    return this.inRangeYLow(link.yMid) &&
      this.inRangeX(link.xMin()) && !this.inRangeX(link.xMax())
  }

  isCrossingSlashPatternB (link) {
    // a -----+
    //    b --(--+
    //        |  |
    //        +--(-- a    : this
    //           +----- b : other link
    //              --->y
    return this.inRangeYHigh(link.yMid) &&
      this.inRangeX(link.xMax()) && !this.inRangeX(link.xMin())
  }

  isCrossingSlash (link) {
    return this.isSameSkew(link, 'slash') &&
      (
        this.isCrossingSlashPatternA(link) ||
        this.isCrossingSlashPatternB(link)
      )
  }

  isOverlap (link) {
    return this.isOverlapX(link) &&
      (
        this.isNearYMid(link) ||
        this.isCrossingBackslash(link) ||
        this.isCrossingSlash(link)
      )
  }

  yMiddlePoint () {
    let ym = this.y1 - 40 // default (if horizontal line)
    if (!this.isSkewHorizontal()) {
      ym = this.height() / 2 + this.yMin()
    }
    return ym
  }

  polylineString () {
    return [
      `${this.x1},${this.y1}`,
      `${this.x1},${this.yMid}`,
      `${this.x2},${this.yMid}`,
      `${this.x2},${this.y2}`
    ].join(' ')
  }
}

export default class InterTpLinkCreator {
  constructor (graphData) {
    const findNodeById = (nodes, id) => {
      return nodes.find(tp => tp.id === id)
    }
    this.links = graphData.links.map(link => {
      const sourceTp = findNodeById(graphData.nodes, link.sourceId)
      const targetTp = findNodeById(graphData.nodes, link.targetId)
      return new InterTpLink(link, sourceTp, targetTp)
    })
    this.checkLineOverlap()
    this.feedbackLineOverlap()
  }

  checkLineOverlap () {
    let overlapIndex = 0
    let overwriteIndex = {}
    // to set overlapIndex for last entry, counter:i must loop at last
    for (let i = 0; i < this.links.length; i++) {
      let oi = overlapIndex
      if (this.links[i].hasOverlapIndex()) {
        oi = this.links[i].overlapIndex
      } else {
        this.links[i].overlapIndex = overlapIndex
        overlapIndex++
      }
      for (let j = i + 1; j < this.links.length; j++) {
        if (this.links[i].isOverlap(this.links[j])) {
          if (this.links[j].hasOverlapIndex() && oi !== this.links[j].overlapIndex) {
            overwriteIndex[oi] = this.links[j].overlapIndex
          }
          this.links[j].overlapIndex = oi
        }
      }
    }
    this.links.forEach(link => {
      if (overwriteIndex[link.overlapIndex]) {
        link.overlapIndex = overwriteIndex[link.overlapIndex]
      }
    })
  }

  slashLinks (linkGroup) {
    //         a b
    //         | |
    //  +------+ |
    //  | +------+
    //  | |   sequence of slash type link
    //  a b   (a -> b)
    return linkGroup
      .filter(link => link.isSkewSlash())
      .sort((a, b) => a.xMax() < b.xMax() ? -1 : 1)
  }

  backslashLinks (linkGroup) {
    //  b a   sequence of backslash type link
    //  | |   (a -> b)
    //  | +------+           +------+   sequence of
    //  +------+ |           | +--+ |   horizontal link
    //         | |           | |  | |   (without crossing)
    //         b a           a b  b a   (a -> b)
    return linkGroup
      .filter(link => !link.isSkewSlash()) // backslash, horizontal, vertical
      .sort((a, b) => a.xMax() < b.xMax() ? 1 : -1)
  }

  feedbackLineOverlap () {
    const uniqOverlapIndex = new Set(this.links.map(link => link.overlapIndex))
    const overlapIndexes = Array.from(uniqOverlapIndex)
    for (const i of overlapIndexes) {
      const linkGroup = this.links.filter(link => link.overlapIndex === i)
      if (linkGroup.length <= 1) {
        continue
      }
      const slashLinks = this.slashLinks(linkGroup)
      const backslashLinks = this.backslashLinks(linkGroup)
      const links = slashLinks.concat(backslashLinks)
      const yMidBase = links.map(link => link.yMid)
        .reduce((sum, val) => sum + val) / links.length // average of yMid
      for (const [j, link] of links.entries()) {
        link.yMid = yMidBase + j * link.lineWidth * 3
      }
    }
  }

  supportTpLinks () {
    return this.links.filter(link => link.type === 'support-tp')
  }

  tpTpLinks () {
    return this.links.filter(link => link.type === 'tp-tp')
  }

  toData () {
    return this.links
  }
}
