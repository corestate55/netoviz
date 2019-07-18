export default class ShallowNestedGraphNode {
  constructor (nodeData, reverse) {
    this.operative = false
    this.type = nodeData.type
    this.name = nodeData.name
    this.path = nodeData.path
    this.id = nodeData.id
    this.setFamilyRelation(nodeData, reverse)
    this.attribute = nodeData.attribute
    this.diffState = nodeData.diffState
    this.layerOrder = -1
  }

  setFamilyRelation (nodeData, reverse) {
    this.parents = nodeData.parents
    this.children = nodeData.children
    if (reverse) {
      if (this.type === 'node') {
        const tps = this.parentTpPaths()
        const childNodes = this.childNodePaths()
        const parentNodes = this.parentNodePaths()
        this.parents = childNodes.concat(tps)
        this.children = parentNodes
      } else { // tp
        const nodes = this.childNodePaths()
        const childTps = this.childTpPaths()
        const parentTps = this.parentTpPaths()
        this.parents = childTps
        this.children = parentTps.concat(nodes)
      }
    }
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
    return path.match(/.+__.+__.+/)
  }

  matchNodePath (path) {
    return !this.matchTpPath(path) && path.match(/.+__.+/)
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

  numberOfTps () {
    return this.parentTpPaths().length
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
    const pathElements = this.path.split('__')
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
    return this.path.split('__').shift()
  }
}
