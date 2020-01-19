'use strict'
/**
 * @file Definition of class to visualize force-simulation network diagram.
 */

import { select, selectAll } from 'd3-selection'
import SingleVisualizerBase from '../common/single-visualizer-base'

/**
 * Force-simulation network diagram visualizer.
 * @extends {SingleVisualizerBase}
 */
class SingleGraphVisualizer extends SingleVisualizerBase {
  /**
   * @param {ForceSimulationNetworkData} graph - Network data.
   * @param {function} findNodeCallback - Function to find nodes
   *     (include in other networks).
   */
  constructor(graph, findNodeCallback) {
    super()
    /** @type {ForceSimulationNetworkData} */
    this.graph = graph
    /**
     * Callback to find node through all layers.
     * @type {Function}
     */
    this.findGraphNodeByPath = findNodeCallback
    /**
     * diff view mode default.
     * @type {string}
     */
    this.currentInactive = 'deleted'
    /**
     * Term-point circle radius.
     * @const
     * @type {number}
     */
    this.tpSize = 5
    /**
     * Node width/height.
     * @const
     * @type {number}
     */
    this.nodeSize = 20

    this._makeAllDiagramElements()
  }

  /**
   * Make all svg elements.
   * @private
   */
  _makeAllDiagramElements() {
    // rename several link properties before make each diagram.
    this._renameLinkKey()

    this._setCanvasSize()
    this.makeGraphSVG(
      this.graph.name,
      this.objClassDef(this.graph, 'network'),
      `${this.graph.name}-group`
    )
    this.makeGraphControlButtons()
    /** @type {Selection} */
    this.link = this._makeLinkLines()
    /** @type {Selection} */
    this.nodeCircle = this._makeNodeOuterCircles()
    /** @type {Selection} */
    this.node = this._makeNodeInnerCircles()
    /** @type {Selection} */
    this.tp = this._makeTermPointCircles()
    /** @type {Selection} */
    this.tpLabel = this._makeTermPointLabels()
    /** @type {Selection} */
    this.nodeLabel = this._makeNodeLabels()
    // setup info table
    this._makeInfoTables()
    // set style of initial inactive objects
    this._setStyleOfInactiveObjects()
  }

  /**
   * Get term-points. (tp-type nodes)
   * @returns {Array<ForceSimulationNode>} Term-points. (tp-type nodes)
   * @protected
   */
  tpTypeNodes() {
    return this.graph.nodes.filter(d => d.type === 'tp')
  }

  /**
   * Get nodes. (node-type nodes)
   * @returns {Array<ForceSimulationNode>} Nodes. (node-type nodes)
   * @protected
   */
  nodeTypeNodes() {
    return this.graph.nodes.filter(d => d.type === 'node')
  }

  /**
   * Make information tables of nodes and term-points.
   * @private
   */
  _makeInfoTables() {
    const tableContainer = this.visContainer
      .append('div')
      .attr('class', 'info-tables')
    this._makeNodeInfoTables(tableContainer)
    this._makeTpInfoTable(tableContainer)
  }

  /**
   * Make information tables of nodes.
   * @param {Selection} tableContainer - Container of node info table.
   * @private
   */
  _makeNodeInfoTables(tableContainer) {
    this.nodeInfoTable = tableContainer
      .append('table')
      .attr('class', 'node-info-table')
    this.nodeInfoTable
      .append('tr') // table header
      .append('th')
      .html('Node')
    this.nodeInfoTable
      .selectAll('td')
      .data(this.nodeTypeNodes())
      .enter()
      .append('tr')
      .append('td')
      .attr('id', d => `${d.path}-ndinfo`)
      .html(d => d.name)
  }

  /**
   * Make information tables of term-points.
   * @param {Selection} tableContainer - Container of term-point info table.
   * @private
   */
  _makeTpInfoTable(tableContainer) {
    this.tpInfoTable = tableContainer
      .append('table')
      .attr('class', 'tp-info-table')
    this.tpInfoTable
      .append('tr')
      .append('th')
      .html('Term Point')
  }

  /**
   * @override
   */
  makeVisContainer() {
    this.visContainer = select('body')
      .select('div#visualizer')
      .append('div')
      .attr('class', 'network-layer')
      .attr('id', `${this.graph.name}-container`)
      .style('display', 'block')
      .html(`<p>${this.graph.name}</p>`)
    return this.visContainer
  }

  /**
   * Make link lines.
   * @returns {Selection} - Selections of link lines.
   * @private
   */
  _makeLinkLines() {
    return this.svgGrp
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(this.graph.links)
      .enter()
      .append('line')
      .attr('id', d => d.path)
      .attr('class', d => this.objClassDef(d, 'topo link'))
  }

  /**
   * Make term-point circles.
   * @returns {Selection} Selection of term-point circles.
   * @private
   */
  _makeTermPointCircles() {
    return (
      this.svgGrp
        .append('g')
        .attr('class', 'term-points')
        .selectAll('circle.tp')
        .data(this.tpTypeNodes())
        .enter()
        .append('circle')
        .attr('class', d => this.objClassDef(d, 'topo tp'))
        // d => ['tp', d.diffState.detect()].join(' ')
        .attr('id', d => d.path)
        .attr('r', this.tpSize)
    )
  }

  /**
   * Make node circles. (inside-circles)
   * @returns {Selection} Selection of node (inside) circles
   * @private
   */
  _makeNodeInnerCircles() {
    return this.svgGrp
      .append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(this.nodeTypeNodes())
      .enter()
      .append('circle')
      .attr('class', d => this.objClassDef(d, 'topo node'))
      .attr('id', d => d.path)
      .attr('r', this.nodeSize * 0.7)
  }

  /**
   * Make node circles. (outside-circles)
   * @returns {Selection} Selection of node (outside) circles.
   * @private
   */
  _makeNodeOuterCircles() {
    return this.svgGrp
      .append('g')
      .attr('class', 'node-circles')
      .selectAll('circle.node-circle')
      .data(this.nodeTypeNodes())
      .enter()
      .append('circle')
      .attr('class', d => this.objClassDef(d, 'topo node-circle'))
      .attr('id', d => `${d.path}-bg`) // background
      .attr('r', this.nodeSize)
  }

  /**
   * Make term-point labels.
   * @returns {Selection} Selection of term-point labels.
   * @private
   */
  _makeTermPointLabels() {
    return this.svgGrp
      .append('g')
      .attr('class', 'tp-labels')
      .selectAll('text.tp-label')
      .data(this.tpTypeNodes())
      .enter()
      .append('text')
      .attr('class', d => this.objClassDef(d, 'topo tp-label'))
      .attr('id', d => `${d.path}-tplb`) // tp label
      .attr('dx', (1.5 * this.tpSize) / 2) // offset to click tp easily
      .text(d => d.name)
  }

  /**
   * Make node labels.
   * @returns {Selection} Selection of node labels.
   * @private
   */
  _makeNodeLabels() {
    return this.svgGrp
      .append('g')
      .attr('class', 'node-labels')
      .selectAll('text.node-label')
      .data(this.nodeTypeNodes())
      .enter()
      .append('text')
      .attr('class', d => this.objClassDef(d, 'topo node-label'))
      .attr('id', d => `${d.path}-ndlb`) // node label
      .text(d => d.name)
  }

  _setCanvasSize() {
    // small (default)
    /** @type {number} */
    this.width = 300
    /** @type {number} */
    this.height = 300

    const graphSize = this.graph.nodes.length
    if (graphSize >= 20 && graphSize < 50) {
      // medium
      this.width = 450
      this.height = 450
    } else if (graphSize >= 50) {
      // large
      this.width = 600
      this.height = 600
    }
  }

  /**
   * Set style to inactive (diff-state) svg elements.
   * @private
   */
  _setStyleOfInactiveObjects() {
    selectAll(`.${this.currentInactive}`).classed('inactive', true)
  }

  /**
   * Rename link property for force-simulation diagram.
   * @private
   */
  _renameLinkKey() {
    for (const d of this.graph.links) {
      d.source = d.sourceId
      d.target = d.targetId
    }
  }
}

export default SingleGraphVisualizer
