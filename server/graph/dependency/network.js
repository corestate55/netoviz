/**
 * @file Definition of Dependency graph network.
 */

import DependencyConstants from './constants'
import DependencyNode from './node'
import DependencyTermPoint from './term-point'

/**
 * Dependency graph network.
 */
class DependencyNetwork {
  /**
   * @param {number} nwIndex - Index of network(layer).
   * @param {ForceSimulationNetworkData} networkData - Network data.
   * @param {boolean} foundTarget - Found target in whole graph.
   */
  constructor(nwIndex, networkData, foundTarget) {
    /** @type {DependencyConstants} */
    this.c = new DependencyConstants()
    /** @type {boolean} */
    this.useAll = !foundTarget
    /** @type {number} */
    this.index = nwIndex
    /** @type {string} */
    this.name = networkData.name
    /** @type {string} */
    this.path = this.name // alias
    this._setPosition(this._calcX(), this._calcY())
    this._setNodes(networkData)
    this._setTermPoints(networkData)
  }

  /**
   * Set position of network.
   * @param {number} lx - X position of network.
   * @param {number} ly - Y position of network.
   * @private
   */
  _setPosition(lx, ly) {
    /** @type {number} */
    this.x = lx
    /** @type {number} */
    this.y = ly
  }

  /**
   * Get x position of network.
   * @returns {number} X position of network.
   * @private
   */
  _calcX() {
    return this.c.layerXPad1
  }

  /**
   * Get height of network.
   * @returns {number} Height of network.
   * @private
   */
  _layerHeight() {
    return this.c.nodeYPad1 + this.c.nodeHeight() + this.c.nodeYPad2
  }

  /**
   * Get y position of network.
   * @returns {number} Y position of network.
   * @private
   */
  _calcY() {
    return (
      this.c.layerYPad1 +
      (this._layerHeight() + this.c.layerYPad2) * (this.index - 1)
    )
  }

  /**
   * Set nodes position.
   * @param {ForceSimulationNetworkData} networkData - Graph data.
   * @private
   */
  _setNodes(networkData) {
    /** @type {Array<DependencyNode>} */
    this.nodes = []
    let nx = this.x + this.c.nodeXPad1
    const termPoints = this._findAllTermPointsFrom(networkData)
    for (const nodes of this._findAllNodesFrom(networkData)) {
      const node = new DependencyNode(nodes, nodeData => {
        return nodeData.parents.filter(parentPath => {
          // With family-filtered dependency graph,
          // term-points of child node (of the target node) is ignored.
          // Because these term-points are 'parents of child of the target,
          // so these are not under children-tree.
          return termPoints.find(tp => tp.path === parentPath)
        })
      })
      node.setPosition(nx, this.y + this.c.nodeYPad1)
      this.nodes.push(node)
      nx += node.nodeWidth() + this.c.nodeXPad2
    }
  }

  /**
   * Find node (both tp and node type node) by path.
   * @param {string} path - Path of node
   * @returns {DependencyNode} Found node.
   * @private
   */
  _findNodeByPath(path) {
    return this.nodes.find(node => node.path === path)
  }

  /**
   * Set term-points position.
   * @param {ForceSimulationNetworkData} networkData - Graph data.
   * @private
   */
  _setTermPoints(networkData) {
    /** @type {Array<DependencyTermPoint>} */
    this.termPoints = []
    for (const termPoints of this._findAllTermPointsFrom(networkData)) {
      const termPoint = new DependencyTermPoint(termPoints)
      const parentNode = this._findNodeByPath(termPoint.parentPath())
      if (parentNode) {
        termPoint.setCenterPosition(parentNode.x, parentNode.y)
        this.termPoints.push(termPoint)
      } else {
        console.log(
          `[dep] Error: parent node (path=${termPoint.parentPath()}) of tp=${
            termPoint.path
          } not found.`
        )
      }
    }
  }

  /**
   * Check node data is specified type.
   * @param {ForceSimulationNodeData} d - Node data.
   * @param {string} type - Type of node (tp/node).
   * @returns {boolean} True if node type is specified one.
   * @private
   */
  _isType(d, type) {
    return d.type === type && (this.useAll || d.family)
  }

  /**
   * Find all node-type nodes.
   * @param {ForceSimulationNetworkData} networkData - Graph data.
   * @returns {Array<ForceSimulationNodeData>} Node-type nodes.
   * @private
   */
  _findAllNodesFrom(networkData) {
    return networkData.nodes.filter(d => this._isType(d, 'node'))
  }

  /**
   * Find all tp-type nodes.
   * @param {ForceSimulationNetworkData} networkData - Graph data.
   * @returns {Array<ForceSimulationNodeData>} Tp-type nodes.
   * @private
   */
  _findAllTermPointsFrom(networkData) {
    return networkData.nodes.filter(d => this._isType(d, 'tp'))
  }

  /**
   * Convert to dependency graph network.
   * @returns {DependencyNetworkData} A network of dependency graph.
   */
  toData() {
    /**
     * @typedef {Object} DependencyNetworkData
     * @prop {number} number
     * @prop {number} x - X position of network.
     * @prop {number} y - Y position of network.
     * @prop {number} height - Height of network.
     * @prop {string} name - Name of network.
     * @prop {string} path - Path of network.
     * @prop {Array<DependencyNodeData>} nodes - Nodes in layer (node-type nodes).
     * @prop {Array<DependencyTermPointData>} tps - Term-points in layer (tp-type nodes).
     */
    return {
      number: this.index,
      x: this.x,
      y: this.y,
      height: this._layerHeight(),
      name: this.name,
      path: this.path,
      nodes: this.nodes.map(node => node.toData()),
      tps: this.termPoints.map(tp => tp.toData())
    }
  }
}

export default DependencyNetwork
