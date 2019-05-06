import DepGraphNodeBase from './base'

export default class DepGraphNode extends DepGraphNodeBase {
  constructor (graphData) {
    super(graphData)
    this.number = Math.floor((graphData.id % 10000) / 100)
    this.tpList = this.tpPaths() // path list of tps in this node
  }

  setPos (nx, ny) {
    this.x = nx
    this.y = ny
  }

  nodeWidth () {
    const numOfTp = this.tpList.length > 0 ? this.tpList.length : 1 // minimum size
    return this.tpXPad1 * 2 + 2 * this.tpR * numOfTp + this.tpXPad2 * (numOfTp - 1)
  }

  tpPaths () {
    return this.parents.filter((parent) => {
      return parent.match(new RegExp(this.path))
    })
  }

  toData () {
    return {
      'number': this.number,
      'x': this.x,
      'y': this.y,
      'width': this.nodeWidth(),
      'height': this.nodeHeight(),
      'name': this.name,
      'path': this.path,
      'type': this.type,
      'parents': this.parents,
      'children': this.children,
      'attribute': this.attribute
    }
  }
}
