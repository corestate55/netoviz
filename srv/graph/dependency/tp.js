import DepGraphNodeBase from './base'

export default class DepGraphTp extends DepGraphNodeBase {
  constructor (graphData) {
    super(graphData)
    this.number = graphData.id % 100
  }

  setCenterPos (cx, cy) {
    this.cx = cx
    this.cy = cy
  }

  calcCenterPos (nx, ny) {
    this.setCenterPos(this.calcX(nx), this.calcY(ny))
  }

  calcX (nx) {
    return nx + this.tpXPad1 +
      (2 * this.tpR + this.tpXPad2) * (this.number - 1) + this.tpR
  }

  calcY (ny) {
    return ny + this.tpYPad1 + this.tpR
  }

  parentPath () {
    const p = this.path.split('__')
    p.pop() // discard last element (tp name)
    return p.join('__')
  }

  toData () {
    return {
      'number': this.number,
      'cx': this.cx,
      'cy': this.cy,
      'r': this.tpR,
      'name': this.name,
      'path': this.path,
      'type': this.type,
      'parents': this.parents,
      'children': this.children,
      'attribute': this.attribute,
      'diffState': this.diffState
    }
  }
}
