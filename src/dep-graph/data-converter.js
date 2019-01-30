class DepGraphConsts {
  constructor () {
    // tp
    this.tpR = 20
    this.tpXPad1 = 12
    this.tpXPad2 = 12
    this.tpYPad1 = 12
    this.tpYPad2 = 24
    // node
    this.nodeXPad1 = 15
    this.nodeXPad2 = 15
    this.nodeYPad1 = 15
    this.nodeYPad2 = 24
    // layer
    this.layerXPad1 = 100
    this.layerYPad1 = 50
    this.layerYPad2 = 30
  }

  nodeHeight () {
    return this.tpYPad1 + 2 * this.tpR + this.tpYPad2 // fixed value
  }
}

class DepGraphNodeBase extends DepGraphConsts {
  constructor (graphData) {
    super()
    this.name = graphData.name
    this.path = graphData.path
    this.children = graphData.children
    this.parents = graphData.parents
    this.type = graphData.type
  }
}

class DepGraphTp extends DepGraphNodeBase {
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
    const p = this.path.split('/')
    p.pop() // discard last element (tp name)
    return p.join('/')
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
      'children': this.children
    }
  }
}

class DepGraphNode extends DepGraphNodeBase {
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
    const numOfTp = this.tpList.length
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
      'children': this.children
    }
  }
}

class DepGraphLayer extends DepGraphConsts {
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
    return this.layerYPad1 + (this.layerHeight() + this.layerYPad2) * (this.number - 1)
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
      'number': this.number,
      'x': this.x,
      'y': this.y,
      'height': this.layerHeight(),
      'name': this.name,
      'path': this.path,
      'nodes': this.nodes.map(node => node.toData()),
      'tps': this.tps.map(tps => tps.toData())
    }
  }
}

export default default class DepGraphConverter {
  constructor (graphData) {
    this.setLayers(graphData)
  }

  setLayers (graphData) {
    this.layers = []
    let layerNum = 1
    for (const layer of graphData) {
      this.layers.push(new DepGraphLayer(layerNum, layer))
      layerNum += 1
    }
  }

  toData () {
    return this.layers.map(layer => layer.toData())
  }
}

// const jsonPath = 'dist/target3b.json.cache'
// const graphData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
// const depGraph = new DepGraph(graphData)
// const resJsonString = JSON.stringify(depGraph.toData())
// console.log(resJsonString)
