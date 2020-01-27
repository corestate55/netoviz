/**
 * @file Definition of class to visualize dependency-2 network diagram.
 */
/**
 * Extended node/term-point data for dependency-2 network diagram.
 * Also used for network (network-type node).
 * @see {DependencyNodeData}
 * @typedef {Object} Dependency2NodeData
 * @prop {number} x
 * @prop {number} y
 * @prop {string} name
 * @prop {string} path
 * @prop {string} type
 * @prop {FamilyRelation} family
 * @prop {Array<string>} parents
 * @prop {Array<string>} children
 * @prop {Object} attribute
 * @prop {DiffState} diffState
 * @prop {boolean} visible
 */

import DiagramBase from '../common/diagram-base'

/**
 * Dependency-2 network diagram visualizer.
 * @extends {DiagramBase}
 */
class Dependency2DiagramBuilder extends DiagramBase {
  /**
   * @param {number} width - Width of diagram. (SVG canvas)
   * @param {number} height - height of diagram. (SVG canvas)
   */
  constructor(width, height) {
    super()
    // canvas size
    /** @type {number} */
    this.width = width
    /** @type {number} */
    this.height = height

    // constants
    /** @const {number} */
    this.networkXPad1 = 10
    /** @const {number} */
    this.networkXPad2 = 160
    /** @const {number} */
    this.networkYPad = 40
    /** @const {number} */
    this.labelXPad = 5
    /** @const {number} */
    this.pYPad = 30
    /** @const {number} */
    this.pXPad = 8
    /** @const {number} */
    this.pR = 10
    /** @const {number} */
    this.fontSize = 18
  }

  /**
   * Make diagram elements for network.
   * @param {DependencyNetworkData} networkData - Network data.
   * @returns {Dependency2NodeData} Network as node data.
   * @private
   */
  _makeNetworkTypeNodeData(networkData) {
    return {
      visible: true,
      type: 'network',
      name: networkData.name,
      path: networkData.path,
      x: null, // must be initialized
      y: null,
      parents: [], // TODO: support-network (parents/children) is ignored (currently)
      children: [],
      attribute: networkData.attribute || {}, // TODO: network attribute is ignored
      diffState: networkData.diffState || {} // TODO: network diffState is ignored
    }
  }

  /**
   * Make diagram elements data list of whole topology.
   * @param {DependencyTopologyData} topologyData - Topology data
   * @returns {Array<Array<Dependency2NodeData>>} List of Nodes/term-points.
   * @private
   */
  _makeNodeDataListOfEachNetworks(topologyData) {
    const elementDataList = []
    for (const networkData of topologyData) {
      // head (network)
      const nodesInNetwork = [this._makeNetworkTypeNodeData(networkData)]
      for (const node of networkData.nodes) {
        // append node
        node.visible = true
        nodesInNetwork.push(/** @type {Dependency2NodeData} */ node)
        // append tps in node
        const termPoints = networkData.tps.filter(d =>
          this.matchChildPath(node.path, d.path)
        )
        if (termPoints) {
          // initial: nw.tps is not used (all nodes are closed)
          termPoints.forEach(tp => {
            tp.visible = false
            return tp
          })
          nodesInNetwork.push(termPoints) // {Array<Dependency2NodeData>} will be flatten.
        }
      }
      elementDataList.push(this.flatten(nodesInNetwork))
    }
    return elementDataList
  }

  /**
   * Delete unused properties from a `DependencyElementData` object.
   * (to be `Dependency2NodeData`)
   * @param {DependencyElementData} elementData - Data object of dependency-diagram.
   * @private
   */
  _deletePropertiesOf(elementData) {
    delete elementData.number
    delete elementData.width
    delete elementData.height
    delete elementData.cx
    delete elementData.cy
    delete elementData.r
  }

  /**
   * Delete unused properties from nodes/term-points in topology data.
   * (to be `Dependency2NodeData`)
   * @param {DependencyTopologyData} topologyData - Topology data.
   * @private
   */
  _rewriteNodeData(topologyData) {
    for (const networkData of topologyData) {
      for (const nodeData of networkData.nodes) {
        this._deletePropertiesOf(nodeData)
      }
      for (const termPointData of networkData.tps) {
        this._deletePropertiesOf(termPointData)
      }
    }
  }

  /**
   * Get indent for each element type.
   * @param {Dependency2NodeData} nodeData - Node data.
   * @returns {number} Indent.
   * @private
   */
  _indentOf(nodeData) {
    const type2indentNumber = {
      network: 0,
      node: 1,
      tp: 2
    }
    return type2indentNumber[nodeData.type]
  }

  /**
   * Calculate position of diagram-elements.
   * @private
   */
  _calculateNodePosition() {
    for (let i = 0; i < this.nodesInNetworks.length; i++) {
      const nodes = this.nodesInNetworks[i] // nodes in network[i]
      if (nodes[0].x == null || nodes[0].y == null) {
        // initialize layer head position (layer head must be type==network)
        nodes[0].x = this.networkXPad1 + i * this.networkXPad2
        nodes[0].y = this.networkYPad
      }
      let v = 1
      for (let j = 1; j < nodes.length; j++) {
        if (!nodes[j].visible) {
          continue
        }
        nodes[j].x = nodes[0].x + this._indentOf(nodes[j]) * this.pXPad
        nodes[j].y = nodes[0].y + v * this.pYPad
        v++
      }
    }
  }

  /**
   * Get all diagram-elements as simple (flat) array.
   * @returns {Array<Dependency2NodeData>} Diagram-elements.
   * @protected
   */
  allNodeDataList() {
    const callback = (acc, curr) => acc.concat(curr)
    return this.nodesInNetworks ? this.nodesInNetworks.reduce(callback, []) : []
  }

  /**
   * Find all visible diagram element.
   * @returns {Array<Dependency2NodeData>} Visible diagram-elements.
   * @private
   */
  _allVisibleNodes() {
    return this.allNodeDataList().filter(d => d.visible)
  }

  /**
   * Make circles of diagram elements.
   * @private
   */
  _makeNodeCircles() {
    const updatedEntries = this.rootSVGGroupSelection
      .selectAll('circle.dep2')
      .data(this._allVisibleNodes())
    const enteredEntries = updatedEntries.enter().append('circle')
    updatedEntries.exit().remove()
    const targetEntries = enteredEntries.merge(updatedEntries)
    targetEntries
      .attr('class', d => this.classStringFrom(d, `dep2 ${d.type}`))
      .attr('id', d => d.path)
      .attr('cx', d => d.x + this.pR)
      .attr('cy', d => d.y + this.pR)
      .attr('r', this.pR)
  }

  /**
   * Make labels of diagram elements.
   * @private
   */
  _makeNodeLabels() {
    const updatedEntries = this.rootSVGGroupSelection
      .selectAll('text.dep2')
      .data(this._allVisibleNodes())
    const enteredEntries = updatedEntries.enter().append('text')
    updatedEntries.exit().remove()
    const targetEntries = enteredEntries.merge(updatedEntries)
    targetEntries
      .attr('class', d => this.classStringFrom(d, `dep2 ${d.type}`))
      .attr('id', d => `${d.path}-lb`)
      .attr('x', d => d.x + 2 * this.pR + this.labelXPad)
      .attr('y', d => d.y + this.fontSize)
      .attr('font-size', this.fontSize)
      .text(d => d.name)
  }

  /**
   * Refresh (redraw) svg elements of networks/nodes/term-points.
   * @protected
   */
  refreshDiagramElements() {
    this._calculateNodePosition()
    this._makeNodeCircles()
    this._makeNodeLabels()
  }

  /**
   * Make svg-group for dependency-lines.
   * @private
   */
  _makeDependencyLineGroup() {
    /**
     * Group to insert dependency lines under other point-circles and labels.
     * @type {Selection}
     */
    this.dependencyLineGroupSelection = this.rootSVGGroupSelection
      .append('g')
      .attr('id', 'dep-lines')
  }

  /**
   * Make all svg elements of dependency-2 network diagram.
   * @param {DependencyTopologyData} topologyData - Topology data.
   * @public
   */
  makeAllDiagramElements(topologyData) {
    // change all `DependencyNodeData` objects and `DependencyElement` data objects
    // to `Dependency2NodeData` objects in topology data (nodes/tps).
    this._rewriteNodeData(topologyData)

    this.makeRootSVG('dependency2-view', '', 'whole-dep2-graph')
    this._makeDependencyLineGroup()
    this.makeDiagramControlButtons()
    /**
     * Array of Diagram-elements array (per network).
     * @type {Array<Array<Dependency2NodeData>>}
     */
    this.nodesInNetworks = this._makeNodeDataListOfEachNetworks(topologyData)
    this.refreshDiagramElements()
  }
}

export default Dependency2DiagramBuilder
