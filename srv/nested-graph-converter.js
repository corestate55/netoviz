class GridOperator {
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

class NestedGraphLink {
  constructor (linkData) {
    this.name = linkData.name
    this.path = linkData.path
    this.type = linkData.type
    this.sourcePath = linkData.sourcePath
    this.targetPath = linkData.targetPath
    this.sourceId = linkData.sourceId
    this.targetId = linkData.targetId
    // this.attribute = linkData.attribute
    // this.diffState = linkData.diffState
  }

  availableIn (nodes) {
    if (this.type === 'node-tp') {
      return false // do not use node-tp type link in Nested Graph
    }
    const source = nodes.find(d => d.path === this.sourcePath)
    const target = nodes.find(d => d.path === this.targetPath)
    return source && target
  }
}

class NestedGraphNode {
  constructor (nodeData) {
    this.operative = false
    this.type = nodeData.type
    this.name = nodeData.name
    this.path = nodeData.path
    this.id = nodeData.id
    this.parents = nodeData.parents
    this.children = nodeData.children
    // this.attribute = nodeData.attribute
    // this.diffState = nodeData.diffState
  }

  isNode () {
    return this.type === 'node'
  }

  isRootNode () {
    return this.isNode() && this.parentNodePaths().length === 0
  }

  isTp () {
    return this.type === 'tp'
  }

  matchTpPath (path) {
    return path.match(/.+\/.+\/.+/)
  }

  matchNodePath (path) {
    return !this.matchTpPath(path) && path.match(/.+\/.+/)
  }

  tpPaths () {
    return this.filterTpPathFrom(this.parents)
  }

  numberOfTps () {
    return this.tpPaths().length
  }

  parentNodePaths () {
    return this.filterNodePath(this.parents)
  }

  childNodePaths () {
    return this.filterNodePath(this.children)
  }

  numberOfParentNodes () {
    return this.parentNodePaths().length
  }

  numberOfChildNodes () {
    return this.childNodePaths().length
  }

  filterTpPathFrom (paths) {
    return paths.filter(path => this.matchTpPath(path))
  }

  filterNodePath (paths) {
    return paths.filter(path => this.matchNodePath(path))
  }

  setCircle (cx, cy, r) {
    this.operative = true
    this.cx = cx
    this.cy = cy
    this.r = r
  }

  setRect (x, y, width, height) {
    this.operative = true
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }

  setGridPosition (ordinalPosition) {
    this.grid = ordinalPosition // { i: N, j:M }
  }
}

class NestedGraphConstants {
  constructor () {
    this.nodeXPad = 10
    this.nodeYPad = 10
    this.r = 5
    this.tpInterval = 6
  }
}

class NestedGraph extends NestedGraphConstants {
  constructor (graphData) {
    super()
    this.setNodes(graphData)
    this.setLinks(graphData)
    this.setRootNodes()
    this.grid = new GridOperator(4, 4, 100)
    this.culcRootNodePosition()
  }

  setNodes (graphData) {
    this.nodes = []
    for (const layer of graphData) {
      for (const node of layer.nodes) {
        this.nodes.push(new NestedGraphNode(node))
      }
    }
  }

  setLinks (graphData) {
    this.links = []
    for (const layer of graphData) {
      this.links = this.links.concat(
        layer.links.map(d => new NestedGraphLink(d))
      )
    }
  }

  setRootNodes () {
    this.rootNodes = this.nodes.filter(d => d.isRootNode())
  }

  findNodeByPath (path) {
    return this.nodes.find(d => d.path === path)
  }

  culcRootNodePosition () {
    for (const rootNode of this.rootNodes) {
      const baseOrdinalPosition = this.grid.nextOrdinalPosition()
      const basePosition = this.grid.positionByOrdinal(baseOrdinalPosition)
      rootNode.setGridPosition(baseOrdinalPosition)
      this.culcNodePosition(rootNode, basePosition)
    }
  }

  singleParentChildNodePaths (node) {
    return node.childNodePaths().filter(path => {
      const childNode = this.findNodeByPath(path)
      return childNode.numberOfParentNodes() === 1
    })
  }

  culcNodePosition (node, basePosition) {
    // console.log(`path: ${node.path}`)
    this.culcTpPosition(node, basePosition)

    // if the node is leaf:
    // only counted as child node when it has single parent.
    // if it has multiple parents, it breaks tree structure.
    if (this.singleParentChildNodePaths(node).length < 1) {
      return this.culcLeafNodeWH(node, basePosition)
    }
    // recursive position calculation
    const childrenWHList = this.culcChildNodePosition(node, basePosition)
    return this.culcSubRootNodeWH(node, basePosition, childrenWHList)
  }

  culcChildNodePosition (node, basePosition) {
    const childrenWHList = [] // [{ width: w, height: h }]
    let nx11 = basePosition.x + this.nodeXPad
    const ny1x = basePosition.y + (this.nodeYPad + this.r) * 2

    for (const childNodePath of this.singleParentChildNodePaths(node)) {
      // console.log(`  childrenNodePath: ${childNodePath}`)
      const childNode = this.findNodeByPath(childNodePath)
      // recursive search
      const wh = this.culcNodePosition(childNode, { x: nx11, y: ny1x })
      childrenWHList.push(wh)
      nx11 += wh.width + this.nodeXPad
    }
    return childrenWHList
  }

  culcSubRootNodeWH (node, basePosition, childrenWHList) {
    // width
    const sumChildWidth = childrenWHList.reduce((sum, d) => sum + d.width, 0)
    const allTpWidth = 2 * this.r * node.numberOfTps() +
      this.tpInterval * (node.numberOfTps() - 1) + this.nodeXPad * 2
    let width = this.nodeXPad * (node.numberOfChildNodes() + 1)
    width += sumChildWidth < allTpWidth ? allTpWidth : sumChildWidth
    // height
    const maxChildHeight = Math.max(...childrenWHList.map(d => d.height))
    // (ny1x - ny1) + maxChildHeight
    const height = (this.nodeYPad + this.r) * 2 + maxChildHeight

    node.setRect(basePosition.x, basePosition.y, width, height)
    return { width: width, height: height }
  }

  culcLeafNodeWH (node, basePosition) {
    // console.log(`  return: ${node.path} does not have child node`)
    const tpNum = node.numberOfTps()
    const width = this.nodeXPad * 2 + 2 * this.r * tpNum + this.tpInterval * (tpNum - 1)
    const height = (this.nodeYPad + this.r) * 2

    node.setRect(basePosition.x, basePosition.y, width, height)
    return { width: width, height: height }
  }

  culcTpPosition (node, basePosition) {
    let cx11 = basePosition.x + this.nodeXPad + this.r
    const cy1x = basePosition.y + this.nodeYPad + this.r
    for (const tpPath of node.tpPaths()) {
      const tp = this.findNodeByPath(tpPath)
      tp.setCircle(cx11, cy1x, this.r)
      cx11 += this.r * 2 + this.nodeXPad
    }
  }

  operativeNodes () {
    return this.nodes.filter(node => node.operative)
  }

  operativeLinksIn (operativeNodes) {
    return this.links.filter(link => link.availableIn(operativeNodes))
  }

  toData () {
    const operativeNodes = this.operativeNodes()
    return {
      nodes: operativeNodes,
      links: this.operativeLinksIn(operativeNodes)
    }
  }
}

export default class NestedGraphConverter {
  constructor (graphData) {
    this.nestedGraph = new NestedGraph(graphData)
  }

  toData () {
    return this.nestedGraph.toData()
  }
}

// const jsonPath = 'dist/target3b.json.cache'
// const graphData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
// const nestedGraph = new NestedGraph(graphData)
// const resJsonString = JSON.stringify(nestedGraph.toData())
// console.log(resJsonString)
