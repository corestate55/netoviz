import DepGraphConstants from './constants'
import DepGraphNode from './node'
import DepGraphTp from './tp'

export default class DepGraphLayer extends DepGraphConstants {
  constructor(layerNum, graphData, foundTarget) {
    super()
    this.useAll = !foundTarget
    this.number = layerNum
    this.name = graphData.name
    this.path = this.name // alias
    this.setPos(this.calcX(), this.calcY())
    this.setNodes(graphData)
    this.setTps(graphData)
  }

  setPos(lx, ly) {
    this.x = lx
    this.y = ly
  }

  calcX() {
    return this.layerXPad1
  }

  layerHeight() {
    return this.nodeYPad1 + this.nodeHeight() + this.nodeYPad2
  }

  calcY() {
    return (
      this.layerYPad1 +
      (this.layerHeight() + this.layerYPad2) * (this.number - 1)
    )
  }

  setNodes(graphData) {
    this.nodes = []
    let nx = this.x + this.nodeXPad1
    const tps = this.tpsFrom(graphData)
    for (const node of this.nodesFrom(graphData)) {
      const dgNode = new DepGraphNode(node, nodeData => {
        return nodeData.parents.filter(parentPath => {
          // With family-filtered dependency graph,
          // term-points of child node (of the target node) is ignored.
          // Because these term-points are 'parents of child of the target,
          // so these are not under children-tree.
          return tps.find(tp => tp.path === parentPath)
        })
      })
      dgNode.setPos(nx, this.y + this.nodeYPad1)
      this.nodes.push(dgNode)
      nx += dgNode.nodeWidth() + this.nodeXPad2
    }
  }

  findNodeByPath(path) {
    return this.nodes.find(node => node.path === path)
  }

  setTps(graphData) {
    this.tps = []
    for (const tp of this.tpsFrom(graphData)) {
      const dgTp = new DepGraphTp(tp)
      const pNode = this.findNodeByPath(dgTp.parentPath())
      if (pNode) {
        dgTp.calcCenterPos(pNode.x, pNode.y)
        this.tps.push(dgTp)
      } else {
        console.log(
          `[dep] Error: parent node (path=${dgTp.parentPath()}) of tp=${
            dgTp.path
          } not found.`
        )
      }
    }
  }

  _isType(d, type) {
    return d.type === type && (this.useAll || d.family)
  }

  nodesFrom(graphData) {
    return graphData.nodes.filter(d => this._isType(d, 'node'))
  }

  tpsFrom(graphData) {
    return graphData.nodes.filter(d => this._isType(d, 'tp'))
  }

  toData() {
    return {
      number: this.number,
      x: this.x,
      y: this.y,
      height: this.layerHeight(),
      name: this.name,
      path: this.path,
      nodes: this.nodes.map(node => node.toData()),
      tps: this.tps.map(tps => tps.toData())
    }
  }
}
