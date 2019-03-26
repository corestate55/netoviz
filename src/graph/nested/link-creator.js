class InterTpLink {
  constructor (link, sourceTp, targetTp) {
    this.lineWidth = 2
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
    this.yMiddle = this.yMiddlePoint()
  }

  minX () {
    return Math.min(this.x1, this.x2)
  }

  minY () {
    return Math.min(this.y1, this.y2)
  }

  maxX () {
    return Math.max(this.x1, this.x2)
  }

  height () {
    return Math.abs(this.y2 - this.y1)
  }

  skewType () {
    if (this.y1 === this.y2) {
      return 'horizontal'
    } else if (this.x1 === this.x2) {
      return 'vertical'
    } else if (
      (this.y1 > this.y2 && this.x1 < this.x2) ||
      (this.y1 < this.y2 && this.x1 > this.x2)) {
      return 'slash'
    } else if (
      (this.y1 > this.y2 && this.x1 > this.x2) ||
      (this.y1 < this.y2 && this.x1 < this.x2)) {
      return 'backslash'
    }
  }

  hasOverlapIndex () {
    return this.overlapIndex >= 0
  }

  isOverlap (link) {
    //            a  b            b  a
    //            |  |            |  |
    //    +--+====+--+    +--+====+--+
    //    |  |            |  |
    //    a  b            a  b
    const b = this.lineWidth * 3
    return (this.yMiddle - b <= link.yMiddle && link.yMiddle <= this.yMiddle + b) &&
      ((this.minX() - b <= link.minX() && link.minX() <= this.maxX() + b) ||
        (link.minX() - b <= this.minX() && this.minX() <= link.maxX() + b))
  }

  yMiddlePoint () {
    let ym = this.y1 - 40 // default (if horizontal line)
    if (this.y1 !== this.y2) { // if not horizontal line
      ym = this.height() / 2 + this.minY()
    }
    return ym
  }

  polylineString () {
    return [
      `${this.x1},${this.y1}`,
      `${this.x1},${this.yMiddle}`,
      `${this.x2},${this.yMiddle}`,
      `${this.x2},${this.y2}`
    ].join(' ')
  }
}

export default class InterTpLinkCreator {
  constructor (graphData) {
    this.links = graphData.links.map(link => {
      const sourceTp = graphData.nodes.find(tp => tp.id === link.sourceId)
      const targetTp = graphData.nodes.find(tp => tp.id === link.targetId)
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
    return linkGroup
      .filter(link => link.skewType() !== 'backslash') // horizontal, vertical, slash
      .sort((a, b) => a.maxX() < b.maxX() ? -1 : 1)
  }

  backslashLinks (linkGroup) {
    return linkGroup
      .filter(link => link.skewType() === 'backslash')
      .sort((a, b) => a.maxX() < b.maxX() ? 1 : -1)
  }

  feedbackLineOverlap () {
    const overlapIndexes = Array.from(
      new Set(this.links.map(link => link.overlapIndex))
    ) // uniq
    for (const i of overlapIndexes) {
      const linkGroup = this.links.filter(link => link.overlapIndex === i)
      if (linkGroup.length <= 1) {
        continue
      }
      const slashLinks = this.slashLinks(linkGroup)
      const backslashLinks = this.backslashLinks(linkGroup)
      for (const [j, link] of slashLinks.concat(backslashLinks).entries()) {
        link.yMiddle += j * link.lineWidth * 3
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
