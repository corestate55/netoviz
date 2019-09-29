'use strict'

import { zoom } from 'd3-zoom'
import { drag } from 'd3-drag'
import { timeout } from 'd3-timer'
import { select, selectAll, event } from 'd3-selection'
import ForceSimulatedVisualizer from './simulated-visualizer'

export default class OperationalVisualizer extends ForceSimulatedVisualizer {
  constructor(graph, findAllNodeFunc) {
    super(graph, findAllNodeFunc)

    // click to double-click delay
    this.delayedClickCallback = null
    // set event callback
    this.setSVGZoom()
    this.setOperationHandler()
    this.setGraphControlButtons(this.clearHighlight)
  }

  clearHighlight() {
    const classList = ['selected-children', 'selected-parents', 'selected']
    for (const cls of classList) {
      selectAll('div#visualizer')
        .selectAll(`.${cls}`)
        .classed(cls, false)
    }
  }

  clearSelectReady() {
    selectAll('div#visualizer')
      .selectAll('.select-ready')
      .classed('select-ready', false)
  }

  setSVGZoom() {
    this.svg.call(
      zoom()
        .scaleExtent([1 / 4, 5])
        .on('zoom', () => this.svgGrp.attr('transform', event.transform))
    )
    this.svg.on('dblclick.zoom', null) // remove zoom-by-double-click
  }

  idListFromPath(path, markClass) {
    if (this.typeOfPath(path) === 'node') {
      // center circle (id=path) is used to indicate 'fixed' and diff-state
      if (markClass[0] === 'fixed') {
        return [path, `${path}-ndinfo`]
      }
      return [`${path}-bg`, `${path}-ndlb`, `${path}-ndinfo`]
    }
    // type === 'tp'
    return [path, `${path}-tplb`, `${path}-tpinfo`]
  }

  markTarget(d, markClass) {
    // console.log(`- mark: ${d.path}, class: ${markClass}`)
    for (const id of this.idListFromPath(d.path, markClass)) {
      const selected = select('#visualizer').select(`[id='${id}']`)
      selected.classed(...markClass)
    }
  }

  markFamilyWith(d, relation, markClass) {
    const relationPaths = d[relation] // parents/children
    for (const relationPath of relationPaths) {
      const relationNode = this.findGraphNodeByPath(relationPath)
      this.markFamilyWith(relationNode, relation, markClass)
      if (markClass[0] === 'selected') {
        this.markTarget(relationNode, [`selected-${relation}`, markClass[1]])
      } else {
        this.markTarget(relationNode, markClass)
      }
    }
  }

  markFamily(d, markClass) {
    this.markFamilyWith(d, 'parents', markClass)
    this.markFamilyWith(d, 'children', markClass)
    this.markTarget(d, markClass)
  }

  highlightNode(d) {
    d && this._clickBody(d)
  }

  _cancelClickEvent() {
    if (this.delayedClickCallback) {
      this.delayedClickCallback.stop()
      this.delayedClickCallback = null
    }
  }

  _clickBody(d) {
    // console.log(`clicked: ${d.path}`)
    this.clearHighlight()
    this.markFamily(d, ['selected', true])
  }

  _click(d) {
    this._cancelClickEvent()
    // exec click event with 300ms delay
    this.delayedClickCallback = timeout(() => this._clickBody(d), 300)
  }

  _doubleClickBody(d) {
    this.markTarget(d, ['fixed', false])
    d.fx = null
    d.fy = null
    this.restartSimulation()
  }

  _doubleClick(d) {
    this._cancelClickEvent()
    this._doubleClickBody(d)
  }

  _mouseOver(d) {
    // console.log(`mouse-over: ${d.path}`)
    if (d.type === 'node') {
      this.appendTpInfoTable(d)
    }
    this.markFamily(d, ['select-ready', true])
    this.tooltip.enableTooltip(d)
  }

  _mouseOut(d) {
    // console.log(`mouse-out: ${d.path}`)
    this.clearSelectReady()
    this.tooltip.disableTooltip()
  }

  setGraphObjectOperationHandler() {
    const dragStart = d => {
      this.markTarget(d, ['fixed', true])
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

  setNodeInfoTableOperationHandler() {
    this.nodeInfoTable
      .selectAll('td')
      .on('click', d => this._click(d))
      .on('dblclick', d => this._doubleClick(d))
      .on('mouseover', d => this._mouseOver(d))
      .on('mouseout', d => this._mouseOut(d))
  }

  _remakeTpInfoTable(tpPaths) {
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

  appendTpInfoTable(d) {
    let node = d
    if (d.type === 'tp') {
      node = this.findGraphNodeByPath(this.parentPathOf(d.path))
    }
    // type === 'node'
    // tp paths are in parents list
    this._remakeTpInfoTable(
      node.parents.filter(p => this.typeOfPath(p) === 'tp')
    )
  }

  setOperationHandler() {
    this.setGraphObjectOperationHandler()
    this.setNodeInfoTableOperationHandler()
  }
}
