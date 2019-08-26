import DepGraphConstants from './constants'
import DepGraphNode from './node'
import DepGraphTp from './tp'

export default class DepGraphLayer extends DepGraphConstants {
  constructor (layerNum, graphData) {
    super()
    this.number = layerNum
    this.name = graphData.name
    this.path = this.name // alias
    this.setPos(this.calcX(), this.calcY())
    this.setNodes(graphData)
    this.setTps(graphData)
  }

  setPos (lx, ly) {
    this.x = lx
    this.y = ly
  }

  calcX () {
    return this.layerXPad1
  }

  layerHeight () {
    return this.nodeYPad1 + this.nodeHeight() + this.nodeYPad2
  }

  calcY () {
    return (
      this.layerYPad1 +
      (this.layerHeight() + this.layerYPad2) * (this.number - 1)
    )
  }

  setNodes (graphData) {
    this.nodes = []
    let nx = this.x + this.nodeXPad1
    for (const node of this.nodesFrom(graphData)) {
      const dgNode = new DepGraphNode(node)
      dgNode.setPos(nx, this.y + this.nodeYPad1)
      this.nodes.push(dgNode)
      nx += dgNode.nodeWidth() + this.nodeXPad2
    }
  }

  findNodeByPath (path) {
    return this.nodes.find(node => node.path === path)
  }

  setTps (graphData) {
    this.tps = []
    for (const tp of this.tpsFrom(graphData)) {
      const dgTp = new DepGraphTp(tp)
      const pNode = this.findNodeByPath(dgTp.parentPath())
      dgTp.calcCenterPos(pNode.x, pNode.y)
      this.tps.push(dgTp)
    }
  }

  nodesFrom (graphData) {
    return graphData.nodes.filter(d => d.type === 'node')
  }

  tpsFrom (graphData) {
    return graphData.nodes.filter(d => d.type === 'tp')
  }

  toData () {
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
