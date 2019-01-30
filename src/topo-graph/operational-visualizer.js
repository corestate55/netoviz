'use strict'

import { zoom } from 'd3-zoom'
import { event, selectAll } from 'd3-selection'
import { timeout } from 'd3-timer'
import { drag } from 'd3-drag'
import ForceSimulatedVisualizer from './simulated-visualizer'
// TODO: suspend attribute operation
// const AttrClassOf = {
//   'L2LinkAttribute': require('../../srv/model/link-l2attr'),
//   'L3LinkAttribute': require('../../srv/model/link-l3attr'),
//   'L2NetworkAttribute': require('../../srv/model/network-l2attr'),
//   'L3NetworkAttribute': require('../../srv/model/network-l3attr'),
//   'L2NodeAttribute': require('../../srv/model/node-l2attr'),
//   'L3NodeAttribute': require('../../srv/model/node-l3attr'),
//   'L2TPAttribute': require('../../srv/model/term-point-l2attr'),
//   'L3TPAttribute': require('../../srv/model/term-point-l3attr')
// }

// NOTE
// arg; `d` : data binded to DOM by d3.js
// arg: `element`: DOM object (NOT a d3.selection)
export default class OperationalVisualizer extends ForceSimulatedVisualizer {
  constructor (graph, findAllNodeFunc) {
    super(graph, findAllNodeFunc)

    // click to double-click delay
    this.delayedClickCallback = null
    // set event callback
    this.setZoomEvnetCallback()
    this.setGraphNodeEventCallback()
    this.setNoeInfoTableEventCallback()
    this.setButtonEventCallback()
  }

  setZoomEvnetCallback () {
    this.nwLayerSvg.call(zoom()
      .scaleExtent([1 / 4, 5])
      .on('zoom', () => this.nwLayer.attr('transform', event.transform))
    )
    this.nwLayerSvg.on('dblclick.zoom', null) // remove zoom-by-double-click
  }

  clearElementHighlight (element) {
    const classList = ['selected-children', 'selected-parents', 'selected']
    for (const d of classList) {
      element.classList.remove(d)
    }
  }

  typeOfPath (path) {
    if (path.match(/.+\/.+\/.+/)) {
      return 'tp'
    }
    return 'node'
  }

  nodePathFromTpPath (path) {
    return path.replace(/\/[.\w]+$/, '') // remove tp name
  }

  pathFromElement (element) {
    // remove id(path) suffix
    return element.id.replace(/-(bg|ndlb|tplb|ndinfo|tpinfo)$/, '')
  }

  highlightElementsByPathOfTp (path, className) {
    // include node info to highlight node info table when tp is select-ready
    const list = [
      document.getElementById(path), // tp itself
      document.getElementById(`${path}-tplb`) // tp label
    ]
    // add parent (node) info when tp caught mouse-over (select-ready)
    if (className === 'select-ready') {
      const nodePath = this.nodePathFromTpPath(path)
      list.push(document.getElementById(`${nodePath}-ndinfo`))
    }
    // TP info table is not always present at all times.
    // Especially for children/parent layer.
    const tpInfo = document.getElementById(`${path}-tpinfo`) // tp info
    if (tpInfo) {
      list.push(tpInfo)
    }
    return list
  }

  highlightElementsByPathOfNode (path) {
    return [
      document.getElementById(`${path}-bg`), // node-circle of the node
      document.getElementById(`${path}-ndlb`), // node label
      document.getElementById(`${path}-ndinfo`) // node info
    ]
  }

  // return element list to highlight according to target object type
  highlightElementsByPath (path, className) {
    if (this.typeOfPath(path) === 'tp') {
      return this.highlightElementsByPathOfTp(path, className)
    }
    return this.highlightElementsByPathOfNode(path)
  }

  // highlight selected node
  highlightNodeByPath (direction, path) {
    for (const element of this.highlightElementsByPath(path, 'selected')) {
      this.clearElementHighlight(element)
      if (direction === 'children') {
        element.classList.add('selected-children')
      } else if (direction === 'parents') {
        element.classList.add('selected-parents')
      } else {
        element.classList.add('selected')
      }
    }
  }

  findSupportingObj (direction, path) {
    // highlight DOM
    // console.log('....', direction, path)
    this.highlightNodeByPath(direction, path)
    // find nodes to highlight via through *all* layers
    const node = this.findGraphNodeByPath(path)
    if (node[direction]) {
      // search children/parent recursively
      for (const d of node[direction]) {
        this.findSupportingObj(direction, d) // recursion
      }
    }
  }

  // Event callback to highlight svg node.
  highlightNode (element) {
    // highlight selected object and its children/parents
    const path = this.pathFromElement(element)
    // console.log('highlight_top: ', path)
    this.findSupportingObj('children', path)
    this.findSupportingObj('parents', path)
    this.findSupportingObj('clicked', path) // dummy direction
  }

  // return element list to show 'fixed' according to target object type
  fixElementsByPath (path) {
    const elements = this.highlightElementsByPath(path, 'fixed')
    if (this.typeOfPath(path) === 'node') {
      // append circle of node itself to show 'fixed'
      elements.push(document.getElementById(path))
    }
    return elements
  }

  classifyNodeAsFixed (element) {
    const path = this.pathFromElement(element)
    for (const elm of this.fixElementsByPath(path)) {
      elm.classList.add('fixed')
    }
  }

  unclassifyNodeAsFixed (element) {
    const path = this.pathFromElement(element)
    for (const elm of this.fixElementsByPath(path)) {
      elm.classList.remove('fixed')
    }
  }

  fireClick (element) {
    this.highlightNode(element)
  }

  fireDblClick (d, element) {
    this.unclassifyNodeAsFixed(element)
    d.fx = null
    d.fy = null
    this.restartSimulation()
  }

  classifyNodeAsSelectReady (element) {
    element.classList.add('select-ready')
  }

  unclassifyNodeAsSelectReady (element) {
    element.classList.remove('select-ready')
  }

  enableTooltip (path) {
    // TODO: suspend attribute operation
    // // tooltip header
    // let tooltipBody = path
    // // tooltip body
    // const node = this.findGraphNodeByPath(path)
    // if (node && Object.keys(node.attribute).length > 0) {
    //   const AttrClass = AttrClassOf[node.attribute.class]
    //   const attr = new AttrClass(node.attribute)
    //   tooltipBody = tooltipBody + attr.toHtml()
    // }
    // this.tooltip
    //   .classed('pop-up', true)
    //   .classed('pop-down', false)
    //   .html(tooltipBody)
  }

  disableTooltip () {
    this.tooltip
      .classed('pop-up', false)
      .classed('pop-down', true)
  }

  mouseOver (element) {
    const path = this.pathFromElement(element)
    // avoid loop: DO NOT make tp info table when the element is in tp info
    if (!(element.id.match(/-tpinfo$/))) {
      this.reMakeTpInfoTable(path)
    }
    // set highlight style
    for (const elm of this.highlightElementsByPath(path, 'select-ready')) {
      this.classifyNodeAsSelectReady(elm)
      this.enableTooltip(path)
    }
  }

  mouseMove (element) {
    this.tooltip
      .style('top', `${event.pageY - 20}px`)
      .style('left', `${event.pageX + 30}px`)
  }

  mouseOut (element) {
    const path = this.pathFromElement(element)
    // remove highlight style
    for (const elm of this.highlightElementsByPath(path, 'select-ready')) {
      this.unclassifyNodeAsSelectReady(elm)
      this.disableTooltip()
    }
  }

  cancelClickEvent () {
    if (this.delayedClickCallback) {
      this.delayedClickCallback.stop()
      this.delayedClickCallback = null
    }
  }

  click (element) {
    this.cancelClickEvent()
    // exec click event with 300ms delay
    this.delayedClickCallback = timeout(() => this.fireClick(element), 300)
  }

  dblClick (d, element) {
    this.cancelClickEvent()
    this.fireDblClick(d, element)
  }

  dragStarted (d, element) {
    this.classifyNodeAsFixed(element)
    d.fx = d.x
    d.fy = d.y
    this.restartSimulation()
  }

  dragged (d) {
    d.fx = event.x
    d.fy = event.y
  }

  dragFinished (d) {
    if (!event.active) {
      this.simulation.alphaTarget(0)
    }
  }

  clearTpInfoTable () {
    this.tpInfoTable.selectAll('tr').remove() // clear tp info table
  }

  addTpInfoTableRecord (tpList) {
    const self = this

    this.tpInfoTable
      .append('tr')
      .append('th')
      .html('Term Point')
    this.tpInfoTable.selectAll('td')
      .data(tpList)
      .enter()
      .append('tr')
      .append('td')
      .attr('id', d => `${d.path}-tpinfo`)
      .attr('class', d => document.getElementById(d.path).classList) // copy from svg tp
      .on('mouseover', function () { self.mouseOver(this) })
      .on('mouseout', function () { self.mouseOut(this) })
      .on('click', function () { self.click(this) })
      .on('dblclick', function (d) { self.dblClick(d, this) })
      .html(d => d.name)
  }

  reMakeTpInfoTable (path) {
    // path is always points node itself or parent of tp
    if (this.typeOfPath(path) === 'tp') {
      path = this.nodePathFromTpPath(path)
    }
    this.clearTpInfoTable()
    const re = new RegExp(`^${path}`)
    const tpList = this.tpTypeNodes().filter(d => d.path.match(re))
    this.addTpInfoTableRecord(tpList)
  }

  setGraphNodeEventCallback () {
    const self = this // alias to use event callback closure

    // objects need to set event handler
    const nodeRelateObjs = [
      this.tp, this.node, this.nodeCircle, this.tpLabel, this.nodeLabel
    ]
    // set event callbacks for circle/labels that means node/tp
    for (const obj of nodeRelateObjs) {
      // use `function() {}` NOT arrow-function `() => {}`.
      // arrow-function bind `this` according to decrared position
      obj
        .on('click', function () { self.click(this) })
        .on('dblclick', function (d) { self.dblClick(d, this) })
        .on('mouseover', function () { self.mouseOver(this) })
        .on('mousemove', function () { self.mouseMove(this) })
        .on('mouseout', function () { self.mouseOut(this) })
        .call(drag()
          .on('start', function (d) { self.dragStarted(d, this) })
          .on('drag', function (d) { self.dragged(d) })
          .on('end', function (d) { self.dragFinished(d) }))
    }
  }

  setNoeInfoTableEventCallback () {
    const self = this // alias to use event callback closure
    // set event callbacks for node info table
    this.nodeInfoTable.selectAll('td')
      .on('click', function () { self.click(this) })
      .on('dblclick', function (d) { self.dblClick(d, this) })
      .on('mouseover', function () { self.mouseOver(this) })
      .on('mouseout', function () { self.mouseOut(this) })
  }

  clearHighlight () {
    // clear all highlighted object
    const classList = ['selected-children', 'selected-parents', 'selected']
    for (const cls of classList) {
      selectAll('div#visualizer').selectAll(`.${cls}`)
        .classed(cls, false)
    }
  }

  toggleActiveDiff () {
    const visualizer = selectAll('div#visualizer')
    visualizer.selectAll(`.${this.currentInactive}`)
      .classed('inactive', false)
      .classed('active', true)
    this.currentInactive = this.currentInactive === 'deleted' ? 'added' : 'deleted'
    visualizer.selectAll(`.${this.currentInactive}`)
      .classed('inactive', true)
      .classed('active', false)
  }

  setButtonEventCallback () {
    // add class to highlight 'button' text when mouse-over/out
    function mouseOverFunc () {
      this.classList.add('select-ready')
    }
    function mouseOutFunc () {
      this.classList.remove('select-ready')
    }

    // set event callback for clear button
    this.clearBtn
      .on('click', this.clearHighlight)
      .on('mouseover', mouseOverFunc)
      .on('mouseout', mouseOutFunc)

    // set event callback for diff active/inactive
    this.toggleBtn
      .on('click', this.toggleActiveDiff)
      .on('mouseover', mouseOverFunc)
      .on('mouseout', mouseOutFunc)
  }
}
