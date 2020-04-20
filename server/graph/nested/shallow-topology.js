/**
 * @file Definition of shallow nested graph.
 */
/**
 * Abstract type as only nested graph node.
 * @typedef {
 *   ShallowNestedNode|DeepNestedNode|AggregatedNestedNode
 * } NestedNode
 */
/**
 * @typedef {NestedNode} NestedNodeData
 */
/**
 * @typedef {NestedLink} NestedLinkData
 */

import GridOperator from './grid-operator'
import ShallowNestedNode from './shallow-node'
import NestedLink from './link'

/**
 * Shallow nested graph.
 */
class ShallowNestedTopology {
  /**
   * @param {NestedGraphQuery} graphQuery - Graph data and options.
   */
  constructor(graphQuery) {
    /**
     * X-padding of node rectangle.
     * @const {number}
     */
    this.nodeXPad = 20
    /**
     * Y-padding of node rectangle.
     * @const {number}
     */
    this.nodeYPad = 20
    /**
     * Radius of term-point circle.
     * @const {number}
     */
    this.r = 10
    /**
     * Interval between term-points.
     * @const {number}
     */
    this.tpInterval = 10

    /** @type {ForceSimulationTopologyData} */
    this.topologyData = graphQuery.topologyData
    /** @type {LayoutData} */
    this.layoutData = graphQuery.layoutData
    /** @type {boolean} */
    this.reverse = graphQuery.reverse
    /**
     * Flag: enable debugging in recursive operation.
     * @type {boolean}
     */
    this.debugCalc = false
  }

  /**
   * Initialize graph.
   * @public
   */
  initialize() {
    this.setGrid()
    this.setNodes()
    this.setLinks()
    this.setRootNodes()
    this.beforeCalcRootNodePosition()
    this.calcRootNodePosition()
  }

  /**
   * Hook before calculate root node position.
   * @abstract
   * @protected
   */
  beforeCalcRootNodePosition() {
    // To be overridden
  }

  /**
   * Set grids from layout data.
   * @protected
   */
  setGrid() {
    /** @type {GridOperator} */
    this.grid = new GridOperator(this.reverse, this.layoutData)
  }

  /**
   * Set nodes from graph data.
   * @protected
   */
  setNodes() {
    this.setNodesAs(node => new ShallowNestedNode(node, this.reverse))
  }

  /**
   * Set nodes using callback.
   * @param {ShallowNestedTopology-generateGraphNodeCallback} generateGraphNodeCallback - Callback
   *     to generate a node.
   * @protected
   */
  setNodesAs(generateGraphNodeCallback) {
    /**
     * @callback ShallowNestedTopology-generateGraphNodeCallback
     * @param {ForceSimulationNodeData} nodeData - Node data for force-simulation diagram.
     * @returns {NestedNodeData} Nested node data.
     */
    /** @type {Array<NestedNodeData>} */
    this.nodes = this.topologyData
      .map(network => network.nodes) // pick nodes in each network.
      .reduce((acc, nodes) => [...acc, ...nodes], []) // flatten
      .map(node => generateGraphNodeCallback(node))
  }

  /**
   * Find a link between two term-points.
   * @param {string} sourcePath - Source term-point path. (link-path format)
   * @param {string} targetPath - Target term-point path. (link-path format)
   * @returns {NestedLink} Found link.
   * @protected
   */
  findLinkBetween(sourcePath, targetPath) {
    return this.links.find(d => {
      return d.sourcePath === sourcePath && d.targetPath === targetPath
    })
  }

  /**
   * Set links from graph data.
   * @protected
   */
  setLinks() {
    const markReverseLink = link => {
      if (link.reverse) {
        return
      }
      const reverseLink = this.findLinkBetween(link.targetPath, link.sourcePath)
      if (reverseLink) {
        // `rev`: reverse, temporary flag to filter.
        reverseLink.reverse = true
      }
    }

    /** @type {Array<NestedLink>} */
    this.links = this.topologyData
      .map(network => network.links) // pick links in each network.
      .reduce((acc, links) => [...acc, ...links], []) // flatten
      .map(link => new NestedLink(link))
    this.links.forEach(markReverseLink)
    this.links = this.links.filter(link => !link.reverse)
  }

  /**
   * Set root nodes.
   * @protected
   */
  setRootNodes() {
    this.rootNodes = this.nodes.filter(d => d.isRootNode())
  }

  /**
   * Find a node by path.
   * @param path
   * @returns {NestedNode} Found node.
   */
  findNodeByPath(path) {
    return this.nodes.find(d => d.path === path)
  }

  /**
   * Map node paths to node objects.
   * @param {Array<string>} paths - Paths.
   * @returns {Array<NestedNode>} Node objects.
   */
  mapPathsToNodes(paths) {
    return paths.map(path => this.findNodeByPath(path))
  }

  /**
   * Calculate position of root nodes.
   * @protected
   */
  calcRootNodePosition() {
    for (const rootNode of this.rootNodes) {
      const ordinalPosition = this.grid.ordinalPositionByNodePath(rootNode.path)
      // only root node has grid information
      rootNode.setGridPosition(ordinalPosition)
      const basePosition = this.grid.positionByOrdinal(ordinalPosition)
      this._calcNodePosition(rootNode, basePosition, 0)
    }
  }

  /**
   * Get paths of child nodes which has only one parent.
   * @param {NestedNode} node - Target node.
   * @returns {Array<string>} Paths (of single-parent child nodes).
   * @private
   */
  _singleParentChildNodePaths(node) {
    return node.childNodePaths().filter(path => {
      const childNode = this.findNodeByPath(path)
      return childNode.numberOfParentNodes() === 1
    })
  }

  /**
   * Check node is leaf. (It does not have any children.)
   * @param {NestedNode} node - Target node.
   * @returns {boolean} True if node is leaf.
   * @protected
   */
  isLeaf(node) {
    // For shallow graph:
    // Only counted as child node when it has single parent.
    // Because if it has multiple parents, it breaks tree structure.
    return this._singleParentChildNodePaths(node).length < 1
  }

  /**
   * Node can be assumed as leaf.
   * @param {NestedNode} node - Target node.
   * @param {number} layerOrder - Order of layer. (for inherited-class)
   * @returns {boolean} True the node can be assumed as leaf.
   * @protected
   */
  assumeAsLeaf(node, layerOrder) {
    return this.isLeaf(node)
  }

  /**
   * Debug print. (for recursive method)
   * @param {number} order - Order of layer
   * @param {string} pos - Position of code.
   * @param {string} message - Debug message.
   * @param {Object} [value] - Value to print.
   * @protected
   */
  consoleDebug(order, pos, message, value) {
    if (!this.debugCalc) {
      return
    }
    if (typeof value === 'undefined') {
      value = ''
    }
    const indent = ' '.repeat(order)
    console.log(`[${order}]${indent} * [${pos}] ${message}`, value)
  }

  /**
   * Calculate Node Width/Height as leaf node.
   * @param {NestedNode} node - Target node.
   * @param {CoordinatePosition} basePosition - Origin of shape.
   * @param {number} layerOrder - Order of layer.
   * @returns {NodeWH} Node Width/Height
   * @private
   */
  _calcNodeWHAsLeaf(node, basePosition, layerOrder) {
    const wh = this._calcLeafNodeWH(node, basePosition, layerOrder)
    this.consoleDebug(
      layerOrder,
      'nodePos',
      `node=${node.path}, lo=${layerOrder} is assumed leaf, return: `,
      wh
    )
    return wh
  }

  /**
   * Calculate width/height of children.
   * @param {NestedNode} node - Target node.
   * @param {CoordinatePosition} basePosition - Origin of shape.
   * @param {number} layerOrder - Order of layer.
   * @returns {Array<NodeWH>} - Width/Height list of target node children.
   * @private
   */
  _calcChildrenWHList(node, basePosition, layerOrder) {
    const arg = [node, basePosition, layerOrder + 2]
    const childrenWHList = this._calcChildNodePosition(...arg)
    this.consoleDebug(
      layerOrder,
      'nodePos',
      `node=${node.path}, children WH list:`,
      childrenWHList
    )
    return childrenWHList
  }

  /**
   * Calculate width/height of sub-root (not root and not leaf) node.
   * @param {NestedNode} node - Target node.
   * @param {CoordinatePosition} basePosition - Origin of shape.
   * @param {number} layerOrder - Order of layer.
   * @param {Array<NodeWH>} childrenWHList - Width/Height list.
   * @returns {NodeWH} Width/Height of target node.
   * @private
   */
  _calcNodeWHAsSubRoot(node, basePosition, layerOrder, childrenWHList) {
    const nodeWH = this._calcSubRootNodeWH(
      node,
      basePosition,
      childrenWHList,
      layerOrder
    )
    this.consoleDebug(
      layerOrder,
      'nodePos',
      `node=${node.path}, return node wh:`,
      nodeWH
    )
    return nodeWH
  }

  /**
   * Calculate node position.
   * @param {NestedNode} node - Target node.
   * @param {CoordinatePosition} basePosition - Origin of shape.
   * @param {number} layerOrder - Order of layer.
   * @returns {NodeWH} Width/Height of target node.
   * @private
   */
  _calcNodePosition(node, basePosition, layerOrder) {
    this.consoleDebug(
      layerOrder,
      'nodePos',
      `node=${node.path}, family?=${node.family}`
    )

    // node rectangle : layerOrder     (0, 2, 4, ...)
    // node tp circle : layerOrder + 1 (1, 3, 5, ...)
    this._calcTpPosition(node, basePosition, layerOrder + 1)
    // calc node Width/Height when the node is leaf.
    if (this.assumeAsLeaf(node, layerOrder)) {
      return this._calcNodeWHAsLeaf(node, basePosition, layerOrder)
    }
    // recursive position calculation
    const childrenWHList = this._calcChildrenWHList(
      node,
      basePosition,
      layerOrder
    )
    if (childrenWHList.length < 1) {
      // if children is empty as a result, the node is same as leaf.
      return this._calcNodeWHAsLeaf(node, basePosition, layerOrder)
    }
    return this._calcNodeWHAsSubRoot(
      node,
      basePosition,
      layerOrder,
      childrenWHList
    )
  }

  /**
   * Get child node paths to calculate position.
   * @param {NestedNode} node - Target node.
   * @param {number} layerOrder - Order of layer.
   * @returns {Array<string>} Paths of children.
   * @protected
   */
  childNodePathsToCalcPosition(node, layerOrder) {
    return this._singleParentChildNodePaths(node)
  }

  /**
   * Find a child node from target node
   * @param {NestedNode} parentNode - Target node.
   * @param {string} childNodePath - Path of child node.
   * @returns {NestedNode} - Found child node.
   * @protected
   */
  childNodeFrom(parentNode, childNodePath) {
    return this.findNodeByPath(childNodePath)
  }

  /**
   * Calculate position of child nodes.
   * @param {NestedNode} node - Target node.
   * @param {CoordinatePosition} basePosition - Origin of shape.
   * @param {number} layerOrder - Order of layer.
   * @returns {Array<NodeWH>} Width/Height list of children.
   * @private
   */
  _calcChildNodePosition(node, basePosition, layerOrder) {
    const childrenWHList = [] // [{ width: w, height: h }]
    let nx11 = basePosition.x + this.nodeXPad
    const ny1x = basePosition.y + (this.nodeYPad + this.r) * 2

    this.consoleDebug(
      layerOrder,
      'childNodePos',
      `node=${node.path}, lo=${layerOrder}`
    )
    const childNodePaths = this.childNodePathsToCalcPosition(node, layerOrder)
    for (const childNodePath of childNodePaths) {
      const childNode = this.childNodeFrom(node, childNodePath)
      this.consoleDebug(
        layerOrder,
        'childNodePos',
        `childrenNodePath=${childNodePath}, family?=${childNode.family}`
      )
      const basePosition = { x: nx11, y: ny1x }
      // recursive search
      const wh = this._calcNodePosition(childNode, basePosition, layerOrder)
      childrenWHList.push(wh)
      nx11 += wh.width + this.nodeXPad
    }
    return childrenWHList
  }

  /**
   * Get width of term-points.
   * @param {NestedNode} node - Target node.
   * @returns {number} Width of term-points.
   * @private
   */
  _widthByTp(node) {
    const tpNum = node.numberOfTps()
    return (
      this.nodeXPad * 2 + 2 * this.r * tpNum + this.tpInterval * (tpNum - 1)
    )
  }

  /**
   * Get height of term-points.
   * @returns {number} Height of term-points.
   * @private
   */
  _heightByTp() {
    return (this.nodeYPad + this.r) * 2
  }

  /**
   * Get width of child nodes.
   * @param {NestedNode} node - Target node.
   * @param {Array<NodeWH>} childrenWHList - Width/Height of children.
   * @returns {number} Width of children.
   * @private
   */
  _widthByChildNodes(node, childrenWHList) {
    // childrenWHList is { width:, height: } object list mapped of node.children.
    // childrenWHList.length is same as a number of children of the node.
    return (
      this.nodeXPad * 2 +
      childrenWHList.reduce((sum, d) => {
        return sum + d.width
      }, 0) +
      this.nodeXPad * (childrenWHList.length - 1)
    )
  }

  /**
   * Get height of child nodes.
   * @param {Array<NodeWH>} childrenWHList - Width/Height of children.
   * @returns {number} Height of children.
   * @private
   */
  _heightByChildNodes(childrenWHList) {
    const maxChildHeight = Math.max(...childrenWHList.map(d => d.height))
    return this._heightByTp() + maxChildHeight + this.nodeYPad
  }

  /**
   * Calculate width/height of sub-root node.
   * @param {NestedNode} node - Target node.
   * @param {CoordinatePosition} basePosition - Origin of shape.
   * @param {Array<NodeWH>} childrenWHList - Width/Height lists of children.
   * @param {number} layerOrder - Order of layer.
   * @returns {NodeWH} Width/Height of target node.
   * @private
   */
  _calcSubRootNodeWH(node, basePosition, childrenWHList, layerOrder) {
    // width
    const widthByChildNodes = this._widthByChildNodes(node, childrenWHList)
    const widthByTp = this._widthByTp(node)
    const width = widthByChildNodes < widthByTp ? widthByTp : widthByChildNodes
    // height
    const height = this._heightByChildNodes(childrenWHList)

    node.setRect(basePosition.x, basePosition.y, width, height, layerOrder)
    return { width, height }
  }

  /**
   * Calculate width/height of leaf node.
   * @param {NestedNode} node - Target node.
   * @param {CoordinatePosition} basePosition - Origin of shape.
   * @param {number} layerOrder - Order of layer.
   * @returns {NodeWH}
   * @private
   */
  _calcLeafNodeWH(node, basePosition, layerOrder) {
    // console.log(`  return: ${node.path} does not have child node`)
    const width = this._widthByTp(node)
    const height = this._heightByTp()

    node.setRect(basePosition.x, basePosition.y, width, height, layerOrder)
    /**
     * @typedef {Object} NodeWH
     * @prop {number} width - Width of a node.
     * @prop {number} height - Height of a node.
     */
    return { width, height }
  }

  /**
   * Calculate position of term-points.
   * @param {NestedNode} node - Target node.
   * @param {CoordinatePosition} basePosition - Origin of shape.
   * @param {number} layerOrder - Order of layer.
   * @private
   */
  _calcTpPosition(node, basePosition, layerOrder) {
    let cx11 = basePosition.x + this.nodeXPad + this.r
    const cy1x = basePosition.y + this.nodeYPad + this.r
    for (const tp of this.mapPathsToNodes(node.parentTpPaths())) {
      tp.setCircle(cx11, cy1x, this.r, layerOrder)
      cx11 += this.r * 2 + this.tpInterval
    }
  }

  /**
   * Get operative nodes.
   * @returns {Array<NestedNode>} Operative nodes.
   * @private
   */
  _operativeNodes() {
    return this.nodes.filter(node => node.operative)
  }

  /**
   * Get inoperative nodes.
   * @returns {Array<NestedNode>} Inoperative nodes.
   * @private
   */
  _inoperativeNodes() {
    return this.nodes.filter(node => !node.operative)
  }

  /**
   * Get links between operative nodes.
   * @param {Array<NestedNode>} operativeNodes - Operative nodes.
   * @returns {Array<NestedLink>} Operative links.
   * @private
   */
  _operativeLinksIn(operativeNodes) {
    return this.links.filter(link => link.availableIn(operativeNodes))
  }

  /**
   * Make operative support link.
   * @param {Array<NestedNode>} operativeNodes - Operative nodes.
   * @returns {Array<NestedLinkData>}
   * @private
   */
  _makeSupportTpLinks(operativeNodes) {
    const supportTpLinks = []
    for (const tp of operativeNodes.filter(d => d.isTp())) {
      // check tp path is available in _operativeNodes?
      for (const childTpPath of tp.childTpPaths()) {
        const childTp = operativeNodes.find(d => d.path === childTpPath)
        if (!childTp) {
          continue
        }
        const name = `${tp.linkPath()},${childTp.linkPath()}`
        supportTpLinks.push({
          name,
          path: `${tp.layer()},${childTp.layer()}__${name}`,
          type: 'support-tp',
          sourcePath: tp.path,
          targetPath: childTpPath,
          diffState: childTp.diffState || {}
        })
      }
    }
    return supportTpLinks
  }

  /**
   * Convert to nested graph data.
   * @returns {NestedTopologyData} Graph data of shallow graph.
   * @public
   */
  toData() {
    const operativeNodes = this._operativeNodes()
    const supportTpLinks = this._makeSupportTpLinks(operativeNodes)
    const ascendingLayerOrder = (a, b) => {
      return a.layerOrder > b.layerOrder ? 1 : -1
    }
    /**
     * @typedef {Object} NestedTopologyData
     * @prop {Array<NestedNodeData>} nodes - Nodes. (operative)
     * @prop {Array<NestedNodeData>} inoperativeNodes - Nodes. (inoperative)
     * @prop {Array<NestedLinkData>} links - Links. (connecting between operative nodes)
     * @prop {GridPositions} grid - Grid positions.
     */
    return {
      nodes: operativeNodes.sort(ascendingLayerOrder),
      // inoperative nodes are used to find parents
      // when hosts must be highlight by alert are not found in operative nodes.
      inoperativeNodes: this._inoperativeNodes(),
      links: this._operativeLinksIn(operativeNodes).concat(supportTpLinks),
      grid: this.grid.toData()
    }
  }
}

export default ShallowNestedTopology
