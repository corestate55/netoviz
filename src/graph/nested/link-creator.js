class InterTpLink {
  constructor (link, sourceTp, targetTp) {
    this.link = link
    this.type = link.type
    this.path = link.path
    this.name = link.name
    this.x1 = sourceTp.cx
    this.y1 = sourceTp.cy
    this.x2 = targetTp.cx
    this.y2 = targetTp.cy
  }

  heightOffset () {
    // node num
    const sn = Math.floor((this.link.sourceId % 10000) / 100)
    const tn = Math.floor((this.link.targetId % 10000) / 100)
    // tp num
    const st = this.link.sourceId % 100
    const tt = this.link.targetId % 100
    const offset = (sn + tn) * 3 + (st + tt) * 5
    // console.log(`[${sn}, ${st}] + [${tn}, ${tt}] => ${offset}`)
    return offset
  }

  polylineString () {
    let yMiddle = 0
    if (this.y1 !== this.y2) {
      // not horizontal line
      yMiddle = Math.abs(this.y2 - this.y1) / 2 + Math.min(this.y1, this.y2)
    } else {
      yMiddle = this.y1 - 80 + this.heightOffset()
    }
    return [
      `${this.x1},${this.y1}`,
      `${this.x1},${yMiddle}`,
      `${this.x2},${yMiddle}`,
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
