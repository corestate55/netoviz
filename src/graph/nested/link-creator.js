class InterTpLink {
  constructor (link, sourceTp, targetTp) {
    this.lineWidth = 2
    this.overlapIndex = -1
    this.link = link
    this.type = link.type
    this.path = link.path
    this.name = link.name
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

  hasOverlapIndex () {
    return this.overlapIndex >= 0
  }

  isOverlap (link) {
    //            a  b            b  a
    //            |  |            |  |
    //    +--+====+--+    +--+====+--+
    //    |  |            |  |
    //    a  b            a  b
    return (this.yMiddle - this.lineWidth * 1.5 <= link.yMiddle &&
      link.yMiddle <= this.yMiddle + this.lineWidth * 1.5) &&
      ((this.minX() <= link.minX() && link.minX() <= this.maxX()) ||
        (link.minX() <= this.minX() && this.minX() <= link.maxX()))
  }

  yMiddlePoint () {
    let ym = this.y1 - 80 // default (if horizontal line)
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
    for (let i = 0; i < this.links.length; i++) {
      if (this.links[i].hasOverlapIndex()) {
        continue
      }
      // to set overlapIndex for last entry, counter:i must loop at last
      this.links[i].overlapIndex = overlapIndex
      for (let j = i + 1; j < this.links.length; j++) {
        if (this.links[i].isOverlap(this.links[j])) {
          this.links[j].overlapIndex = overlapIndex
        }
      }
      overlapIndex++
    }
  }

  feedbackLineOverlap () {
    const overlapIndexes = this.links.map(link => link.overlapIndex)
    for (const i of overlapIndexes) {
      const linkGroup = this.links.filter(link => link.overlapIndex === i)
      if (linkGroup.length <= 1) {
        continue
      }
      for (const [j, link] of linkGroup.entries()) {
        link.yMiddle += j * link.lineWidth * 1.2
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
