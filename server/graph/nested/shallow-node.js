/**
 * @file Definition of node for shallow nested graph.
 */

/**
 * Node for shallow nested graph.
 * @see {@link ShallowNestedTopology}
 */
class ShallowNestedNode {
  /**
   * @param {ForceSimulationNodeData} nodeData - Node data.
   * @param {boolean} reverse - Flag for top/bottom view selection.
   */
  constructor(nodeData, reverse) {
    /** @type {boolean} */
    this.operative = false
    /** @type {string} */
    this.type = nodeData.type
    /** @type {string} */
    this.name = nodeData.name
    /** @type {string} */
    this.path = nodeData.path
    /** @type {number} */
    this.id = nodeData.id

    this._setFamilyRelation(nodeData, reverse)

    /** @type {Object} */
    this.attribute = nodeData.attribute
    /** @type {DiffState} */
    this.diffState = nodeData.diffState
    /** @type {number} */
    this.layerOrder = -1
  }

  /**
   * Set family (parents/children) according to `reverse` flag.
   * @param {ForceSimulationNodeData} nodeData - Node data.
   * @param reverse - Flag for top/bottom view selection.
   * @private
   */
  _setFamilyRelation(nodeData, reverse) {
    /** @type {Array<string>} */
    this.parents = nodeData.parents
    /** @type {Array<string>} */
    this.children = nodeData.children
    if (reverse) {
      if (this.type === 'node') {
        const tps = this.parentTpPaths()
        const childNodes = this.childNodePaths()
        const parentNodes = this.parentNodePaths()
        this.parents = childNodes.concat(tps)
        this.children = parentNodes
      } else {
        // tp
        const nodes = this.childNodePaths()
        const childTps = this.childTpPaths()
        const parentTps = this.parentTpPaths()
        this.parents = childTps
        this.children = parentTps.concat(nodes)
      }
    }
  }

  /**
   * Get layer path which contains myself.
   * @returns {string} Layer path.
   * @public
   */
  layerPath() {
    const paths = this.path.split('__')
    paths.pop()
    return paths.join('__')
  }

  /**
   * Get layer name (network name).
   * @returns {string} layer name.
   * @public
   */
  layer() {
    return this.path.split('__').shift()
  }

  /**
   * Check node type is node.
   * @returns {boolean} True if node-type node.
   * @public
   */
  isNode() {
    return this.type === 'node'
  }

  /**
   * Check root node.
   * @returns {boolean} True if root node.
   * @public
   */
  isRootNode() {
    return this.isNode() && this.parentNodePaths().length === 0
  }

  /**
   * Check node type is tp (termination-point).
   * @returns {boolean} True if tp-type node.
   * @public
   */
  isTp() {
    return this.type === 'tp'
  }

  /**
   * Check path matches format of term-point.
   * @param {string} path - Path to check.
   * @returns {boolean} True if term-point-format path.
   * @public
   */
  matchTpPath(path) {
    return Boolean(path.match(/.+__.+__.+/))
  }

  /**
   * Check path matches format of node.
   * @param {string} path - Path to check.
   * @returns {boolean} True if node-format path.
   * @public
   */
  matchNodePath(path) {
    return !this.matchTpPath(path) && Boolean(path.match(/.+__.+/))
  }

  /**
   * Get parent node paths. (node-type node path)
   * @returns {Array<string>} Paths of parent-node.
   * @public
   */
  parentNodePaths() {
    return this.filterNodePath(this.parents)
  }

  /**
   * Get parent term-point paths. (tp-type node path)
   * (term-point is onto its node as parent)
   * @returns {Array<string>} Paths of term-point.
   * @public
   */
  parentTpPaths() {
    return this.filterTpPath(this.parents)
  }

  /**
   * Get children node paths. (node-type node path)
   * @returns {Array<string>} Paths of node.
   * @public
   */
  childNodePaths() {
    return this.filterNodePath(this.children)
  }

  /**
   * Get children tp paths. (tp-type node path)
   * @returns {Array<string>} Paths of term-point.
   * @public
   */
  childTpPaths() {
    return this.filterTpPath(this.children)
  }

  /**
   * Get number of term-points. (onto node-type node)
   * @returns {number} Number of term-points.
   * @public
   */
  numberOfTps() {
    return this.parentTpPaths().length
  }

  /**
   * Get number of parent-nodes.
   * @returns {number} Number of parent nodes.
   * @public
   */
  numberOfParentNodes() {
    return this.parentNodePaths().length
  }

  /**
   * Get number of child-nodes.
   * @returns {number} Number of child nodes.
   * @public
   */
  numberOfChildNodes() {
    return this.childNodePaths().length
  }

  /**
   * Paths matches term-point path format.
   * @param {Array<string>} paths - Paths.
   * @returns {Array<string>} Term-point format paths.
   * @public
   */
  filterTpPath(paths) {
    return paths.filter(path => this.matchTpPath(path))
  }

  /**
   * Paths matches node path format.
   * @param {Array<string>} paths - Paths.
   * @returns {Array<string>} Node format paths.
   * @public
   */
  filterNodePath(paths) {
    return paths.filter(path => this.matchNodePath(path))
  }

  /**
   * Get half of link path element. (corresponding one of term point)
   * @returns {string} A element of link path.
   * @public
   */
  linkPath() {
    // to make link path
    const pathElements = this.path.split('__')
    pathElements.shift() // discard top(layer)
    return pathElements.join(',')
  }

  /**
   * Set coordinate attribute for circle.
   * @param {number} cx - X of circle center.
   * @param {number} cy - Y of circle center.
   * @param {number} r - Radius of circle center.
   * @param {number} layerOrder - Order of layer.
   * @public
   */
  setCircle(cx, cy, r, layerOrder) {
    this.operative = true
    this.cx = cx
    this.cy = cy
    this.r = r
    this.layerOrder = layerOrder
  }

  /**
   * Set coordinate attribute for rectangle.
   * @param {number} x - X of rectangle left-top point.
   * @param {number} y - Y of rectangle left-top point.
   * @param {number} width - Width of rectangle.
   * @param {number} height - Height of rectangle.
   * @param {number} layerOrder - Order of layer.
   * @public
   */
  setRect(x, y, width, height, layerOrder) {
    this.operative = true
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.layerOrder = layerOrder
  }

  /**
   * Set grid position (id) attribute to snap the shape.
   * @param {Object} ordinalPosition - Grid number object, { i: N, j:M }
   * @public
   */
  setGridPosition(ordinalPosition) {
    this.grid = ordinalPosition
  }
}

export default ShallowNestedNode
