export default class GridOperator {
  constructor (layoutData) {
    if (layoutData === undefined || layoutData === null ||
      'found' in layoutData && !layoutData.found) {
      this.layoutData = { layout: {}, grid: {} } // empty data
      this.initDefault(4, 10, 200)
    } else {
      this.layoutData = layoutData
      this.setXYGrid()
    }
    this.currentX = 0
    this.currentY = 0
  }

  setXYGrid () {
    this.xGrids = this.layoutData.grid.x
    this.yGrids = this.layoutData.grid.y
  }

  initDefault (ni, nj, interval) {
    this.setXGridByInterval(ni, interval)
    this.setYGridByInterval(nj, interval)
  }

  setXGridByInterval (ni, interval) {
    this.xGrids = []
    for (let i = 0; i < ni; i++) {
      this.xGrids.push((i + 1) * interval)
    }
  }

  setYGridByInterval (nj, interval) {
    this.yGrids = []
    for (let j = 0; j < nj; j++) {
      this.yGrids.push((j + 1) * interval)
    }
  }

  positionByOrdinal (ordinalPosition) {
    return this.position(ordinalPosition.i, ordinalPosition.j)
  }

  position (i, j) {
    // TODO: range error check
    return { x: this.xGrids[i], y: this.yGrids[j] }
  }

  nextOrdinalPosition () {
    const i = this.currentX
    const j = this.currentY
    // set next
    this.currentX = (i + 1) % this.xGrids.length
    if (this.currentX === 0) {
      this.currentY = (j + 1) % this.yGrids.length
    }
    return { i: i, j: j } // current
  }

  ordinalPositionByNodePath (path) {
    const ordinalPosition = this.layoutData.layout[path]
    if (ordinalPosition) {
      return ordinalPosition
    }
    return this.nextOrdinalPosition()
  }

  toData () {
    return { x: this.xGrids, y: this.yGrids }
  }
}
