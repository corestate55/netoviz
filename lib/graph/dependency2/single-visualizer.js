/**
 * @file Definition of class to visualize dependency-2 network diagram.
 */
/**
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
 * Extended node/term-point data for dependency-2 network diagram.
 * Also used for network (network-type node).
 * @see {DependencyNodeData}
 */

import SingleVisualizerBase from '../common/single-visualizer-base'

/**
 * Dependency-2 network diagram visualizer.
 * @extends {SingleVisualizerBase}
 */
class SingleDep2GraphVisualizer extends SingleVisualizerBase {
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
    /**
     * @const
     * @type {number}
     */
    this.layer_xpad1 = 10
    /**
     * @const
     * @type {number}
     */
    this.layer_xpad2 = 160
    /**
     * @const
     * @type {number}
     */
    this.layer_ypad = 40
    /**
     * @const
     * @type {number}
     */
    this.label_xpad = 5
    /**
     * @const
     * @type {number}
     */
    this.p_ypad = 30
    /**
     * @const
     * @type {number}
     */
    this.p_xpad = 8
    /**
     * @const
     * @type {number}
     */
    this.p_r = 10
    /**
     * @const
     * @type {number}
     */
    this.fontSize = 18
  }

  /**
   * Make svg elements of network.
   * @param {DependencyNetworkData} nw - Network data.
   * @returns {Dependency2NodeData} Network as node data.
   * @private
   */
  _makeDrawNetworkData(nw) {
    return {
      visible: true,
      type: 'network',
      name: nw.name,
      path: nw.path,
      x: null, // must be initialized
      y: null,
      parents: [], // TODO: support-network (parents/children) is ignored (currently)
      children: [],
      attribute: nw.attribute || {}, // TODO: network attribute is ignored
      diffState: nw.diffState || {} // TODO: network diffState is ignored
    }
  }

  /**
   * Make svg elements of whole topology.
   * @param {DependencyTopologyData} graphData - Topology data
   * @returns {Array<Array<Dependency2NodeData>>} List of Nodes/term-points.
   * @private
   */
  _makeDrawGraphData(graphData) {
    const objects = []
    for (const nw of graphData) {
      // head (network)
      const nwObjs = [this._makeDrawNetworkData(nw)]
      for (const node of nw.nodes) {
        // append node
        node.visible = true
        nwObjs.push(/** @type {Dependency2NodeData} */ node)
        // append tps in node
        const tps = nw.tps.filter(d => this.matchChildPath(node.path, d.path))
        if (tps) {
          // initial: nw.tps is not used (all nodes are closed)
          tps.forEach(tp => {
            tp.visible = false
            return tp
          })
          nwObjs.push(tps) // {Array<Dependency2NodeData>} will be flatten.
        }
      }
      objects.push(this.flatten(nwObjs))
    }
    return objects
  }

  /**
   * Delete unused properties from a `DependencyElementData` object.
   * (to be `Dependency2NodeData`)
   * @param {DependencyElementData} object - Data object of dependency-diagram.
   * @private
   */
  _deleteUnusedPropsOf(object) {
    delete object.number
    delete object.width
    delete object.height
    delete object.cx
    delete object.cy
    delete object.r
  }

  /**
   * Delete unused properties from nodes/term-points in topology data.
   * (to be `Dependency2NodeData`)
   * @param {DependencyTopologyData} graphData - Topology data.
   * @private
   */
  _deleteUnusedProps(graphData) {
    for (const nwObjs of graphData) {
      for (const nwObj of nwObjs.nodes) {
        this._deleteUnusedPropsOf(nwObj)
      }
      for (const nwObj of nwObjs.tps) {
        this._deleteUnusedPropsOf(nwObj)
      }
    }
  }

  /**
   * Get indent for each element type.
   * @param {Dependency2NodeData} nwObj - Node data.
   * @returns {number} Indent.
   * @private
   */
  _indentOf(nwObj) {
    const type2indentNum = {
      network: 0,
      node: 1,
      tp: 2
    }
    return type2indentNum[nwObj.type]
  }

  /**
   * Calculate position of diagram-elements.
   * @private
   */
  _calculatePositionOfDrawGraphData() {
    for (let i = 0; i < this.drawGraphData.length; i++) {
      const nwObjects = this.drawGraphData[i] // a list of layer entries
      if (nwObjects[0].x == null || nwObjects[0].y == null) {
        // initialize layer head position (layer head must be type==network)
        nwObjects[0].x = this.layer_xpad1 + i * this.layer_xpad2
        nwObjects[0].y = this.layer_ypad
      }
      let v = 1
      for (let j = 1; j < nwObjects.length; j++) {
        if (!nwObjects[j].visible) {
          continue
        }
        nwObjects[j].x =
          nwObjects[0].x + this._indentOf(nwObjects[j]) * this.p_xpad
        nwObjects[j].y = nwObjects[0].y + v * this.p_ypad
        v++
      }
    }
  }

  /**
   * Get all diagram-elements as simple (flat) array.
   * @returns {Array<Dependency2NodeData>} Diagram-elements.
   * @protected
   */
  flatDrawGraphDataList() {
    const callback = (acc, curr) => acc.concat(curr)
    return this.drawGraphData ? this.drawGraphData.reduce(callback, []) : []
  }

  /**
   * Find all visible diagram element.
   * @returns {Array<Dependency2NodeData>} Visible diagram-elements.
   * @private
   */
  _visibleDrawGraphData() {
    return this.flatDrawGraphDataList().filter(d => d.visible)
  }

  /**
   * Make circles of diagram elements.
   * @private
   */
  _makeEntryCircles() {
    const updatedEntries = this.svgGrp
      .selectAll('circle.dep2')
      .data(this._visibleDrawGraphData())
    const enteredEntries = updatedEntries.enter().append('circle')
    updatedEntries.exit().remove()
    const targetEntries = enteredEntries.merge(updatedEntries)
    targetEntries
      .attr('class', d => this.objClassDef(d, `dep2 ${d.type}`))
      .attr('id', d => d.path)
      .attr('cx', d => d.x + this.p_r)
      .attr('cy', d => d.y + this.p_r)
      .attr('r', this.p_r)
  }

  /**
   * Make labels of diagram elements.
   * @private
   */
  _makeEntryLabels() {
    const updatedEntries = this.svgGrp
      .selectAll('text.dep2')
      .data(this._visibleDrawGraphData())
    const enteredEntries = updatedEntries.enter().append('text')
    updatedEntries.exit().remove()
    const targetEntries = enteredEntries.merge(updatedEntries)
    targetEntries
      .attr('class', d => this.objClassDef(d, `dep2 ${d.type}`))
      .attr('id', d => `${d.path}-lb`)
      .attr('x', d => d.x + 2 * this.p_r + this.label_xpad)
      .attr('y', d => d.y + this.fontSize)
      .attr('font-size', this.fontSize)
      .text(d => d.name)
  }

  /**
   * Refresh (redraw) svg elements of networks/nodes/term-points.
   * @protected
   */
  refreshGraphObjects() {
    this._calculatePositionOfDrawGraphData()
    this._makeEntryCircles()
    this._makeEntryLabels()
  }

  /**
   * Make svg-group for dependency-lines.
   * @private
   */
  _makeDependencyLineSVGGroup() {
    /**
     * Group to insert dependency lines under other point-circles and labels.
     * @type {Selection}
     */
    this.depLineSVGGrp = this.svgGrp.append('g').attr('id', 'dep-lines')
  }

  /**
   * Make all svg elements of dependency-2 network diagram.
   * @param {DependencyTopologyData} graphData
   * @public
   */
  makeGraphObjects(graphData) {
    // change all `DependencyNodeData` objects and `DependencyElement` data objects
    // to `Dependency2NodeData` objects in topology data (nodes/tps).
    this._deleteUnusedProps(graphData)

    this.makeGraphSVG('dependency2-view', '', 'whole-dep2-graph')
    this._makeDependencyLineSVGGroup()
    this.makeGraphControlButtons()
    /**
     * Array of Diagram-elements array (per network).
     * @type {Array<Array<Dependency2NodeData>>}
     */
    this.drawGraphData = this._makeDrawGraphData(graphData)
    this.refreshGraphObjects()
  }
}

export default SingleDep2GraphVisualizer
