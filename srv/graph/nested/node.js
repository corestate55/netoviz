export default class NestedGraphNode {
  constructor (nodeData, reverse) {
    this.operative = false
    this.split = 0
    this.type = nodeData.type
    this.name = nodeData.name
    this.path = nodeData.path
    this.id = nodeData.id
    this.setFamilyRelation(nodeData, reverse)
    this.attribute = nodeData.attribute
    // this.diffState = nodeData.diffState
    this.layerOrder = -1
  }

  setFamilyRelation (nodeData, reverse) {
    this.parents = nodeData.parents
    this.children = nodeData.children
    if (reverse) {
      if (this.type === 'node') {
        const tps = this.tpPathsInParents()
        const childNodes = this.childNodePaths()
        const parentNodes = this.parentNodePaths()
        this.parents = childNodes.concat(tps)
        this.children = parentNodes
      } else { // tp
        const nodes = this.nodePathsInChildren()
        const childTps = this.childTpPaths()
        const parentTps = this.parentTpPaths()
        this.parents = childTps.concat(nodes)
        this.children = parentTps
      }
    }
  }

  renameChildPath (oldChildPath, newChildPath) {
    // operation for parent node of multiple-parents node
    // (change child info)
    this.children = this.children
      .filter(d => d !== oldChildPath)
      .concat(newChildPath)
  }

  splitByParent (parentPath) {
    // operation for child node which has multiple-parents
    // (copy and change parents info)
    const splitNode = new NestedGraphNode(this)
    splitNode.path = `${this.path}::${this.split}`
    splitNode.children = this.children
    // splitNode.parents = this.parentTpPaths().concat(parentPath)
    splitNode.parents = [ parentPath ]
    // delete and ignore tp path
    this.parents = this.parentNodePaths().filter(d => d !== parentPath)
    splitNode.split++
    this.split++

    return splitNode
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

  tpPathsInParents () {
    return this.filterTpPath(this.parents)
  }

  nodePathsInChildren () {
    return this.filterNodePath(this.children)
  }

  numberOfTps () {
    return this.tpPathsInParents().length
  }

  parentNodePaths () {
    return this.filterNodePath(this.parents)
  }

  parentTpPaths () {
    return this.filterTpPath(this.parents)
  }

  childNodePaths () {
    return this.filterNodePath(this.children)
  }

  childTpPaths () {
    return this.filterTpPath(this.children)
  }

  numberOfParentNodes () {
    return this.parentNodePaths().length
  }

  numberOfChildNodes () {
    return this.childNodePaths().length
  }

  filterTpPath (paths) {
    return paths.filter(path => this.matchTpPath(path))
  }

  filterNodePath (paths) {
    return paths.filter(path => this.matchNodePath(path))
  }

  linkPath () {
    // to make link path
    const pathElements = this.path.split('/')
    pathElements.shift() // discard top(layer)
    return pathElements.join(',')
  }

  setCircle (cx, cy, r, layerOrder) {
    this.operative = true
    this.cx = cx
    this.cy = cy
    this.r = r
    this.layerOrder = layerOrder
  }

  setRect (x, y, width, height, layerOrder) {
    this.operative = true
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.layerOrder = layerOrder
  }

  setGridPosition (ordinalPosition) {
    this.grid = ordinalPosition // { i: N, j:M }
  }

  layer () {
    return this.path.split('/').shift()
  }
}
