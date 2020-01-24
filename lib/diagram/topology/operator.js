'use strict'
/**
 * @file Definition of class to visualize force-simulation network diagram.
 */

import { zoom } from 'd3-zoom'
import { drag } from 'd3-drag'
import { timeout } from 'd3-timer'
import { select, selectAll, event } from 'd3-selection'
import ForceSimulationDiagramSimulator from './simulator'

/**
 * Force-simulation network diagram visualizer with interactive operations.
 * @extends {ForceSimulationDiagramSimulator}
 */
class ForceSimulationDiagramOperator extends ForceSimulationDiagramSimulator {
  /**
   * @override
   */
  constructor(networkData, findNodeCallback) {
    super(networkData, findNodeCallback)
    /**
     * Click to double-click delay
     * @type {Timer}
     */
    this.delayedClickCallback = null
    this._setAllDiagramElementsHandler()
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
  _setRootSVGZoom() {
    this.rootSVGSelection.call(
      zoom()
        .scaleExtent([1 / 4, 5])
        .on('zoom', () =>
          this.rootSVGGroupSelection.attr('transform', event.transform)
        )
    )
    this.rootSVGSelection.on('dblclick.zoom', null) // remove zoom-by-double-click
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
   * @param {ForceSimulationNodeData} nodeData - Node data.
   * @param {Array<string>} markClass - List of class-strings to set node.
   * @public
   */
  markNodeWith(nodeData, markClass) {
    // console.log(`- mark: ${d.path}, class: ${markClass}`)
    for (const id of this._idListFromPath(nodeData.path, markClass)) {
      const selected = select('#visualizer').select(`[id='${id}']`)
      selected.classed(...markClass)
    }
  }

  /**
   * Mark a side (relation) of family-nodes of node with specified classes.
   * @param {ForceSimulationNodeData} nodeData - Node data.
   * @param {string} relation - `parents` or `children`
   * @param {Array<string>} markClass - List of class-strings to set node.
   * @private
   */
  _markRelateFamilyNodesWith(nodeData, relation, markClass) {
    const relationPaths = nodeData[relation] // parents/children
    for (const relationPath of relationPaths) {
      const relationNode = this.findNodeDataByPath(relationPath)
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
   * @param {ForceSimulationNodeData} nodeData - Node data.
   * @param {Array<string>} markClass - List of class-strings to set node.
   * @private
   */
  _markFamilyNodeWith(nodeData, markClass) {
    this._markRelateFamilyNodesWith(nodeData, 'parents', markClass)
    this._markRelateFamilyNodesWith(nodeData, 'children', markClass)
    this.markNodeWith(nodeData, markClass) // origin (target) itself
  }

  /**
   * Highlight node.
   * @param {ForceSimulationNodeData} nodeData - Node data.
   */
  highlightNode(nodeData) {
    nodeData && this._clickOperation(nodeData)
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
   * @param {ForceSimulationNodeData} nodeData - Node data.
   * @private
   */
  _clickOperation(nodeData) {
    // console.log(`clicked: ${d.path}`)
    this.clearHighlight()
    this._markFamilyNodeWith(nodeData, ['selected', true])
  }

  /**
   * Event handler for node-click.
   * @param {ForceSimulationNodeData} nodeData - Node data.
   * @private
   */
  _clickHandler(nodeData) {
    this._cancelClickEvent()
    // exec click event with 300ms delay
    this.delayedClickCallback = timeout(
      () => this._clickOperation(nodeData),
      300
    )
  }

  /**
   * Operation when double click.
   * @param {ForceSimulationNodeData} nodeData - Node data.
   * @private
   */
  _doubleClickOperation(nodeData) {
    this.markNodeWith(nodeData, ['fixed', false])
    nodeData.fx = null
    nodeData.fy = null
    this.restartSimulation()
  }

  /**
   * Event handler for node double-click.
   * @param {ForceSimulationNodeData} nodeData - Node data.
   * @private
   */
  _doubleClickHandler(nodeData) {
    this._cancelClickEvent()
    this._doubleClickOperation(nodeData)
  }

  /**
   * Event handler for node mouse-over.
   * @param {ForceSimulationNodeData} nodeData - Node data.
   * @private
   */
  _mouseOverHandler(nodeData) {
    // console.log(`mouse-over: ${d.path}`)
    if (nodeData.type === 'node') {
      this._appendTermPointInfoTable(nodeData)
    }
    this._markFamilyNodeWith(nodeData, ['select-ready', true])
    this.tooltip.enableTooltip(nodeData)
  }

  /**
   * Event handler for node mouse-out.
   * @param {ForceSimulationNodeData} nodeData - Node data.
   * @private
   */
  _mouseOutHandler(nodeData) {
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

    const dragFinished = () => {
      if (!event.active) {
        this.simulation.alphaTarget(0)
      }
    }

    const targets = ['node', 'node-circle', 'tp', 'tp-label', 'node-label']
    for (const target of targets) {
      this.rootSVGGroupSelection
        .selectAll(`.${target}`)
        .on('click', d => this._clickHandler(d))
        .on('dblclick', d => this._doubleClickHandler(d))
        .on('mouseover', d => this._mouseOverHandler(d))
        .on('mouseout', d => this._mouseOutHandler(d))
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
    this.nodeInfoTableSelection
      .selectAll('td')
      .on('click', d => this._clickHandler(d))
      .on('dblclick', d => this._doubleClickHandler(d))
      .on('mouseover', d => this._mouseOverHandler(d))
      .on('mouseout', d => this._mouseOutHandler(d))
  }

  /**
   * Remake (update) term-point information table.
   * @param {Array<string>} termPointPaths - Paths of term-points. (tp-type nodes).
   * @private
   */
  _refreshTermPointInfoTable(termPointPaths) {
    const termPointData = termPointPaths.map(p => this.findNodeDataByPath(p))
    this.termPointInfoTableSelection.selectAll('tr.tpinfo').remove()
    this.termPointInfoTableSelection
      .selectAll('tr.tpinfo')
      .data(termPointData)
      .enter()
      .append('tr')
      .attr('class', 'tpinfo')
      .append('td')
      .attr('id', d => `${d.path}-tpinfo`)
      .on('click', d => this._clickHandler(d))
      .on('dblclick', d => this._doubleClickHandler(d))
      .on('mouseover', d => this._mouseOverHandler(d))
      .on('mouseout', d => this._mouseOutHandler(d))
      .html(d => d.name)
  }

  /**
   * Append term-point information table.
   * @param {ForceSimulationNodeData} nodeData - Node data.
   * @private
   */
  _appendTermPointInfoTable(nodeData) {
    let parentNode = nodeData
    if (nodeData.type === 'tp') {
      parentNode = this.findNodeDataByPath(this.parentPathOf(nodeData.path))
    }
    // type === 'node'
    // tp paths are in parents list
    this._refreshTermPointInfoTable(
      parentNode.parents.filter(p => this.typeOfPath(p) === 'tp')
    )
  }

  /**
   * Set all event-handlers.
   * @private
   */
  _setAllDiagramElementsHandler() {
    this._setRootSVGZoom()
    this._setDiagramElementsHandler()
    this._setNodeInfoTableHandler()
    this.setDiagramControlButtonsHandler(this.clearHighlight)
  }
}

export default ForceSimulationDiagramOperator
