'use strict'
/**
 * @file Definition of class to visualize force-simulation network diagram.
 */

import { selectAll } from 'd3-selection'
import DiagramBase from '../common/diagram-base'

/**
 * Force-simulation network diagram visualizer.
 * @extends {DiagramBase}
 */
class ForceSimulationDiagramBuilder extends DiagramBase {
  /**
   * @param {ForceSimulationNetworkData} networkData - Network data.
   * @param {ForceSimulationDiagramBuilder-findNodeCallback} findNodeCallback - Function
   *     to find nodes. (include in other networks)
   */
  constructor(networkData, findNodeCallback) {
    super()
    /** @type {ForceSimulationNetworkData} */
    this.networkData = networkData
    /**
     * Callback to find node through all layers.
     * @callback ForceSimulationDiagramBuilder-findNodeCallback
     * @param {string} path - Path of find target.
     * @returns {ForceSimulationNodeData} Found node data.
     */
    /** @type {ForceSimulationDiagramBuilder-findNodeCallback} */
    this.findNodeDataByPath = findNodeCallback
    /**
     * diff view mode default.
     * @type {string}
     */
    this.currentInactive = 'deleted'
    /**
     * Term-point circle radius.
     * @const {number}
     */
    this.termPointSize = 5
    /**
     * Node width/height.
     * @const {number}
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
    this._renameLinkProperty()

    this._setRootSVGSize()
    this.makeRootSVG(
      this.networkData.name,
      this.classStringFrom(this.networkData, 'network'),
      `${this.networkData.name}-group`
    )
    this.makeDiagramControlButtons()
    /** @type {Selection} */
    this.linkLinesSelection = this._makeLinkLines()
    /** @type {Selection} */
    this.nodeOuterCirclesSelection = this._makeNodeOuterCircles()
    /** @type {Selection} */
    this.nodeInnerCirclesSelection = this._makeNodeInnerCircles()
    /** @type {Selection} */
    this.termPointCirclesSelection = this._makeTermPointCircles()
    /** @type {Selection} */
    this.termPointLabelsSelection = this._makeTermPointLabels()
    /** @type {Selection} */
    this.nodeLabelsSelection = this._makeNodeLabels()
    // setup info table
    this._makeInfoTables()
    // set style of initial inactive objects
    this._setCurrentInactiveElementsToInactive()
  }

  /**
   * Get term-points. (tp-type nodes)
   * @returns {Array<ForceSimulationNode>} Term-points. (tp-type nodes)
   * @public
   */
  tpTypeNodes() {
    return this.networkData.nodes.filter(d => d.type === 'tp')
  }

  /**
   * Get nodes. (node-type nodes)
   * @returns {Array<ForceSimulationNode>} Nodes. (node-type nodes)
   * @public
   */
  nodeTypeNodes() {
    return this.networkData.nodes.filter(d => d.type === 'node')
  }

  /**
   * Make information tables of nodes and term-points.
   * @private
   */
  _makeInfoTables() {
    const tableContainerSelection = this.diagramContainerSelection
      .append('div')
      .attr('class', 'info-tables')
    this._makeNodeInfoTable(tableContainerSelection)
    this._makeTermPointInfoTable(tableContainerSelection)
  }

  /**
   * Make information tables of nodes.
   * @param {Selection} tableContainer - Container of node info table.
   * @private
   */
  _makeNodeInfoTable(tableContainer) {
    this.nodeInfoTableSelection = tableContainer
      .append('table')
      .attr('class', 'node-info-table')
    this.nodeInfoTableSelection
      .append('tr') // table header
      .append('th')
      .html('Node')
    this.nodeInfoTableSelection
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
  _makeTermPointInfoTable(tableContainer) {
    /** @type {Selection} */
    this.termPointInfoTableSelection = tableContainer
      .append('table')
      .attr('class', 'tp-info-table')
    this.termPointInfoTableSelection
      .append('tr')
      .append('th')
      .html('Term Point')
  }

  /**
   * @override
   */
  makeDiagramContainer() {
    const diagramContainerSelection = super.makeDiagramContainer()
    diagramContainerSelection
      .attr('id', `${this.networkData.name}-container`)
      .style('display', 'block')
      .html(`<p>${this.networkData.name}</p>`)
    return diagramContainerSelection
  }

  /**
   * Make link lines.
   * @returns {Selection} - Selections of link lines.
   * @private
   */
  _makeLinkLines() {
    return this.rootSVGGroupSelection
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(this.networkData.links)
      .enter()
      .append('line')
      .attr('id', d => d.path)
      .attr('class', d => this.classStringFrom(d, 'topo link'))
  }

  /**
   * Make term-point circles.
   * @returns {Selection} Selection of term-point circles.
   * @private
   */
  _makeTermPointCircles() {
    return (
      this.rootSVGGroupSelection
        .append('g')
        .attr('class', 'term-points')
        .selectAll('circle.tp')
        .data(this.tpTypeNodes())
        .enter()
        .append('circle')
        .attr('class', d => this.classStringFrom(d, 'topo tp'))
        // d => ['tp', d.diffState.detect()].join(' ')
        .attr('id', d => d.path)
        .attr('r', this.termPointSize)
    )
  }

  /**
   * Make node circles. (inside-circles)
   * @returns {Selection} Selection of node (inside) circles
   * @private
   */
  _makeNodeInnerCircles() {
    return this.rootSVGGroupSelection
      .append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(this.nodeTypeNodes())
      .enter()
      .append('circle')
      .attr('class', d => this.classStringFrom(d, 'topo node'))
      .attr('id', d => d.path)
      .attr('r', this.nodeSize * 0.7)
  }

  /**
   * Make node circles. (outside-circles)
   * @returns {Selection} Selection of node (outside) circles.
   * @private
   */
  _makeNodeOuterCircles() {
    return this.rootSVGGroupSelection
      .append('g')
      .attr('class', 'node-circles')
      .selectAll('circle.node-circle')
      .data(this.nodeTypeNodes())
      .enter()
      .append('circle')
      .attr('class', d => this.classStringFrom(d, 'topo node-circle'))
      .attr('id', d => `${d.path}-bg`) // background
      .attr('r', this.nodeSize)
  }

  /**
   * Make term-point labels.
   * @returns {Selection} Selection of term-point labels.
   * @private
   */
  _makeTermPointLabels() {
    return this.rootSVGGroupSelection
      .append('g')
      .attr('class', 'tp-labels')
      .selectAll('text.tp-label')
      .data(this.tpTypeNodes())
      .enter()
      .append('text')
      .attr('class', d => this.classStringFrom(d, 'topo tp-label'))
      .attr('id', d => `${d.path}-tplb`) // tp label
      .attr('dx', (1.5 * this.termPointSize) / 2) // offset to click tp easily
      .text(d => d.name)
  }

  /**
   * Make node labels.
   * @returns {Selection} Selection of node labels.
   * @private
   */
  _makeNodeLabels() {
    return this.rootSVGGroupSelection
      .append('g')
      .attr('class', 'node-labels')
      .selectAll('text.node-label')
      .data(this.nodeTypeNodes())
      .enter()
      .append('text')
      .attr('class', d => this.classStringFrom(d, 'topo node-label'))
      .attr('id', d => `${d.path}-ndlb`) // node label
      .text(d => d.name)
  }

  _setRootSVGSize() {
    // small (default)
    /** @type {number} */
    this.width = 300
    /** @type {number} */
    this.height = 300

    const diagramSize = this.networkData.nodes.length
    if (diagramSize >= 20 && diagramSize < 50) {
      // medium
      this.width = 450
      this.height = 450
    } else if (diagramSize >= 50) {
      // large
      this.width = 600
      this.height = 600
    }
  }

  /**
   * Set style to inactive (diff-state) svg elements.
   * @private
   */
  _setCurrentInactiveElementsToInactive() {
    selectAll(`.${this.currentInactive}`).classed('inactive', true)
  }

  /**
   * Rename link property for force-simulation diagram.
   * @private
   */
  _renameLinkProperty() {
    for (const d of this.networkData.links) {
      d.source = d.sourceId
      d.target = d.targetId
    }
  }
}

export default ForceSimulationDiagramBuilder
