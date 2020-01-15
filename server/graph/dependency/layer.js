/**
 * @file Definition of Dependency graph layer(network).
 */
import DepGraphConstants from './constants'
import DepGraphNode from './node'
import DepGraphTp from './tp'

/**
 * Dependency graph layer(network).
 * @extends {DepGraphConstants}
 */
class DepGraphLayer extends DepGraphConstants {
  /**
   * @param {number} layerNum
   * @param {TopologyGraphData} graphData - Graph data.
   * @param {boolean} foundTarget - Found target in whole graph.
   */
  constructor(layerNum, graphData, foundTarget) {
    super()
    /** @type {boolean} */
    this.useAll = !foundTarget
    /** @type {number} */
    this.number = layerNum
    /** @type {string} */
    this.name = graphData.name
    /** @type {string} */
    this.path = this.name // alias
    this._setPos(this._calcX(), this._calcY())
    this._setNodes(graphData)
    this._setTps(graphData)
  }

  /**
   * Set position of layer(network).
   * @param {number} lx - X position of layer.
   * @param {number} ly - Y position of layer.
   * @private
   */
  _setPos(lx, ly) {
    /** @type {number} */
    this.x = lx
    /** @type {number} */
    this.y = ly
  }

  /**
   * Get x position of layer(network).
   * @returns {number} X position of layer.
   * @private
   */
  _calcX() {
    return this.layerXPad1
  }

  /**
   * Get height of layer(network).
   * @returns {number} Height of layer.
   * @private
   */
  _layerHeight() {
    return this.nodeYPad1 + this.nodeHeight() + this.nodeYPad2
  }

  /**
   * Get y position of layer(network).
   * @returns {number} Y position of layer.
   * @private
   */
  _calcY() {
    return (
      this.layerYPad1 +
      (this._layerHeight() + this.layerYPad2) * (this.number - 1)
    )
  }

  /**
   * Set nodes position.
   * @param {TopologyGraphData} graphData - Graph data.
   * @private
   */
  _setNodes(graphData) {
    /** @type {Array<DepGraphNode>} */
    this.nodes = []
    let nx = this.x + this.nodeXPad1
    const tps = this._tpsFrom(graphData)
    for (const node of this._nodesFrom(graphData)) {
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

  /**
   * Find node (both tp and node type node) by path.
   * @param {string} path - Path of node
   * @returns {DepGraphNode} Found node.
   * @private
   */
  _findNodeByPath(path) {
    return this.nodes.find(node => node.path === path)
  }

  /**
   * Set term-points position.
   * @param {TopologyGraphData} graphData - Graph data.
   * @private
   */
  _setTps(graphData) {
    /** @type {Array<DepGraphTp>} */
    this.tps = []
    for (const tp of this._tpsFrom(graphData)) {
      const dgTp = new DepGraphTp(tp)
      const pNode = this._findNodeByPath(dgTp.parentPath())
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

  /**
   * Check node data is specified type.
   * @param {TopologyGraphNodeData} d - Node data.
   * @param {string} type - Type of node (tp/node).
   * @returns {boolean} True if node type is specified one.
   * @private
   */
  _isType(d, type) {
    return d.type === type && (this.useAll || d.family)
  }

  /**
   * Find all node-type nodes.
   * @param {TopologyGraphData} graphData - Graph data.
   * @returns {Array<TopologyGraphNodeData>}
   * @private
   */
  _nodesFrom(graphData) {
    return graphData.nodes.filter(d => this._isType(d, 'node'))
  }

  /**
   * Find all tp-type nodes.
   * @param {TopologyGraphData} graphData - Graph data.
   * @returns {Array<TopologyGraphNodeData>}
   * @private
   */
  _tpsFrom(graphData) {
    return graphData.nodes.filter(d => this._isType(d, 'tp'))
  }

  /**
   * Convert to dependency graph layer(network).
   * @returns {DependencyGraphNetworkData} A layer(network) of dependency graph.
   */
  toData() {
    /**
     * @typedef {Object} DependencyGraphNetworkData
     * @prop {number} number
     * @prop {number} x - X position of layer.
     * @prop {number} y - Y position of layer.
     * @prop {number} height - Height of layer.
     * @prop {string} name - Name of layer.
     * @prop {string} path - Path of layer.
     * @prop {Array<DependencyGraphNodeData>} nodes - Nodes in layer (node-type nodes).
     * @prop {Array<DependencyGraphTermPointData>} tps - Term-points in layer (tp-type nodes).
     */
    return {
      number: this.number,
      x: this.x,
      y: this.y,
      height: this._layerHeight(),
      name: this.name,
      path: this.path,
      nodes: this.nodes.map(node => node.toData()),
      tps: this.tps.map(tps => tps.toData())
    }
  }
}

export default DepGraphLayer
