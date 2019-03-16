export default class GridOperator {
  constructor (ni, nj, interval) {
    this.setXGrid(ni, interval)
    this.setYGrid(nj, interval)
    this.currentX = 0
    this.currentY = 0
  }

  setXGrid (ni, interval) {
    this.xGrids = []
    for (let i = 0; i < ni; i++) {
      this.xGrids.push((i + 1) * interval)
    }
  }

  setYGrid (nj, interval) {
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
    this.currentX = (i + 1) % this.xGrids.length
    if (this.currentX === 0) {
      this.currentY = (j + 1) % this.yGrids.length
    }
    return { i: i, j: j }
  }
}
