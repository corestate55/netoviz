'use strict'
/**
 * @file Definition of class to visualize force-simulation network diagram.
 */

import { zoom } from 'd3-zoom'
import { drag } from 'd3-drag'
import { timeout } from 'd3-timer'
import { select, selectAll, event } from 'd3-selection'
import ForceSimulatedVisualizer from './simulated-visualizer'

/**
 * Force-simulation network diagram visualizer with interactive operations.
 * @extends {ForceSimulatedVisualizer}
 */
class OperationalVisualizer extends ForceSimulatedVisualizer {
  /**
   * @override
   */
  constructor(graph, findNodeCallback) {
    super(graph, findNodeCallback)
    /**
     * Click to double-click delay
     * @type {Timer}
     */
    this.delayedClickCallback = null
    this._setOperationHandler()
  }

  /**
   * Clear highlight.
   * @public
   */
  clearHighlight() {
    const classList = ['selected-children', 'selected-parents', 'selected']
    for (const cls of classList) {
      selectAll('div#visualizer')
        .selectAll(`.${cls}`)
        .classed(cls, false)
    }
  }

  /**
   * Clear select-ready.
   * @private
   */
  _clearSelectReady() {
    selectAll('div#visualizer')
      .selectAll('.select-ready')
      .classed('select-ready', false)
  }

  /**
   * Set zoom to svg canvas.
   * @private
   */
  _setSVGZoom() {
    this.svg.call(
      zoom()
        .scaleExtent([1 / 4, 5])
        .on('zoom', () => this.svgGrp.attr('transform', event.transform))
    )
    this.svg.on('dblclick.zoom', null) // remove zoom-by-double-click
  }

  /**
   * Get class-list for svg element corresponding node/term-point of path.
   * @param {string} path - Path of node/term-point.
   * @param {Array<string>} markClass - List of class-strings to set node.
   * @returns {Array<string>} List of class-string for svg element.
   * @private
   */
  _idListFromPath(path, markClass) {
    if (this.typeOfPath(path) === 'node') {
      // inner circle (id=path) is used to indicate 'fixed' and diff-state
      if (markClass[0] === 'fixed') {
        return [path, `${path}-ndinfo`]
      }
      return [`${path}-bg`, `${path}-ndlb`, `${path}-ndinfo`]
    }
    // type === 'tp'
    return [path, `${path}-tplb`, `${path}-tpinfo`]
  }

  /**
   * Set class of target svg element of node
   * @param {ForceSimulationNodeData} node - Node data.
   * @param {Array<string>} markClass - List of class-strings to set node.
   * @public
   */
  markNodeWith(node, markClass) {
    // console.log(`- mark: ${d.path}, class: ${markClass}`)
    for (const id of this._idListFromPath(node.path, markClass)) {
      const selected = select('#visualizer').select(`[id='${id}']`)
      selected.classed(...markClass)
    }
  }

  /**
   * Mark a side (relation) of family-nodes of node with specified classes.
   * @param {ForceSimulationNodeData} node - Node data.
   * @param {string} relation - `parents` or `children`
   * @param {Array<string>} markClass - List of class-strings to set node.
   * @private
   */
  _markRelateFamilyNodesWith(node, relation, markClass) {
    const relationPaths = node[relation] // parents/children
    for (const relationPath of relationPaths) {
      const relationNode = this.findGraphNodeByPath(relationPath)
      this._markRelateFamilyNodesWith(relationNode, relation, markClass)
      if (markClass[0] === 'selected') {
        this.markNodeWith(relationNode, [`selected-${relation}`, markClass[1]])
      } else {
        this.markNodeWith(relationNode, markClass)
      }
    }
  }

  /**
   * Mark family-nodes of node with specified classes.
   * @param {ForceSimulationNodeData} node - Node data.
   * @param {Array<string>} markClass - List of class-strings to set node.
   * @private
   */
  _markFamilyNodeWith(node, markClass) {
    this._markRelateFamilyNodesWith(node, 'parents', markClass)
    this._markRelateFamilyNodesWith(node, 'children', markClass)
    this.markNodeWith(node, markClass) // origin (target) itself
  }

  /**
   * Highlight node.
   * @param {ForceSimulationNodeData} node - Node data.
   */
  highlightNode(node) {
    node && this._clickBody(node)
  }

  /**
   * Cancel click event. (for double-click control.)
   * @private
   */
  _cancelClickEvent() {
    if (this.delayedClickCallback) {
      this.delayedClickCallback.stop()
      this.delayedClickCallback = null
    }
  }

  /**
   * Operation when clicked.
   * @param {ForceSimulationNodeData} node - Node data.
   * @private
   */
  _clickBody(node) {
    // console.log(`clicked: ${d.path}`)
    this.clearHighlight()
    this._markFamilyNodeWith(node, ['selected', true])
  }

  /**
   * Event handler for node-click.
   * @param {ForceSimulationNodeData} node - Node data.
   * @private
   */
  _click(node) {
    this._cancelClickEvent()
    // exec click event with 300ms delay
    this.delayedClickCallback = timeout(() => this._clickBody(node), 300)
  }

  /**
   * Operation when double click.
   * @param {ForceSimulationNodeData} node - Node data.
   * @private
   */
  _doubleClickBody(node) {
    this.markNodeWith(node, ['fixed', false])
    node.fx = null
    node.fy = null
    this.restartSimulation()
  }

  /**
   * Event handler for node double-click.
   * @param {ForceSimulationNodeData} node - Node data.
   * @private
   */
  _doubleClick(node) {
    this._cancelClickEvent()
    this._doubleClickBody(node)
  }

  /**
   * Event handler for node mouse-over.
   * @param {ForceSimulationNodeData} node - Node data.
   * @private
   */
  _mouseOver(node) {
    // console.log(`mouse-over: ${d.path}`)
    if (node.type === 'node') {
      this._appendTermPointInfoTable(node)
    }
    this._markFamilyNodeWith(node, ['select-ready', true])
    this.tooltip.enableTooltip(node)
  }

  /**
   * Event handler for node mouse-out.
   * @param {ForceSimulationNodeData} node - Node data.
   * @private
   */
  _mouseOut(node) {
    // console.log(`mouse-out: ${d.path}`)
    this._clearSelectReady()
    this.tooltip.disableTooltip()
  }

  /**
   * Set event handler for to svg diagram elements.
   * @private
   */
  _setDiagramElementsHandler() {
    const dragStart = d => {
      this.markNodeWith(d, ['fixed', true])
      d.fx = d.x
      d.fy = d.y
      this.restartSimulation()
    }

    const dragged = d => {
      d.fx = event.x
      d.fy = event.y
    }

    const dragFinished = d => {
      if (!event.active) {
        this.simulation.alphaTarget(0)
      }
    }

    const targets = ['node', 'node-circle', 'tp', 'tp-label', 'node-label']
    for (const target of targets) {
      this.svgGrp
        .selectAll(`.${target}`)
        .on('click', d => this._click(d))
        .on('dblclick', d => this._doubleClick(d))
        .on('mouseover', d => this._mouseOver(d))
        .on('mouseout', d => this._mouseOut(d))
        .call(
          drag()
            .on('start', dragStart)
            .on('drag', dragged)
            .on('end', dragFinished)
        )
    }
  }

  /**
   * Set event handler to node/term-point information tables.
   * @private
   */
  _setNodeInfoTableHandler() {
    this.nodeInfoTable
      .selectAll('td')
      .on('click', d => this._click(d))
      .on('dblclick', d => this._doubleClick(d))
      .on('mouseover', d => this._mouseOver(d))
      .on('mouseout', d => this._mouseOut(d))
  }

  /**
   * Remake (update) term-point information table.
   * @param {Array<string>} tpPaths - Paths of term-points. (tp-type nodes).
   * @private
   */
  _remakeTermPointInfoTable(tpPaths) {
    const tps = tpPaths.map(p => this.findGraphNodeByPath(p))
    this.tpInfoTable.selectAll('tr.tpinfo').remove()
    this.tpInfoTable
      .selectAll('tr.tpinfo')
      .data(tps)
      .enter()
      .append('tr')
      .attr('class', 'tpinfo')
      .append('td')
      .attr('id', d => `${d.path}-tpinfo`)
      .on('click', d => this._click(d))
      .on('dblclick', d => this._doubleClick(d))
      .on('mouseover', d => this._mouseOver(d))
      .on('mouseout', d => this._mouseOut(d))
      .html(d => d.name)
  }

  /**
   * Append term-point information table.
   * @param {ForceSimulationNodeData} node - Node data.
   * @private
   */
  _appendTermPointInfoTable(node) {
    let parentNode = node
    if (node.type === 'tp') {
      parentNode = this.findGraphNodeByPath(this.parentPathOf(node.path))
    }
    // type === 'node'
    // tp paths are in parents list
    this._remakeTermPointInfoTable(
      parentNode.parents.filter(p => this.typeOfPath(p) === 'tp')
    )
  }

  /**
   * Set all event-handlers.
   * @private
   */
  _setOperationHandler() {
    this._setSVGZoom()
    this._setDiagramElementsHandler()
    this._setNodeInfoTableHandler()
    this.setGraphControlButtons(this.clearHighlight)
  }
}

export default OperationalVisualizer
