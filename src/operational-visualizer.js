'use strict'

import * as d3 from 'd3'
import { ForceSimulatedVisualizer } from './simulated-visualizer'

// NOTE
// arg; `d` : data binded to DOM by d3.js
// arg: `element`: DOM object (NOT a d3.selection)
export class OperationalVisualizer extends ForceSimulatedVisualizer {
  constructor (graph, findAllNodeFunc) {
    super(graph, findAllNodeFunc)

    // set event callback
    this.setZoomEvnetCallback()
    this.setGraphNodeEventCallBack()
    this.setButtonEventCallback()
  }

  setZoomEvnetCallback () {
    this.nwLayerSvg.call(d3.zoom()
      .scaleExtent([1 / 4, 5])
      .on('zoom', () => this.nwLayer.attr('transform', d3.event.transform))
    )
    this.nwLayerSvg.on('dblclick.zoom', null) // remove zoom-by-double-click
  }

  clearElementHighlight (element) {
    const classList = ['selected-children', 'selected-parents', 'selected']
    for (const d of classList) {
      element.classList.remove(d)
    }
  }

  pathObjType (path) {
    if (path.match(/.+\/.+\/.+/)) {
      return 'tp'
    }
    return 'node'
  }

  nodePathFromTpPath (path) {
    return path.replace(/\/[.\w]+$/, '') // remove tp name
  }

  pathBody (path) {
    // remove each id(path) suffix
    return path.replace(/-(bg|ndlb|tplb|ndinfo|tpinfo)$/, '')
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

  highlightElementsByPath (path, className) {
    if (this.pathObjType(path) === 'tp') {
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
    console.log('....', direction, path)
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
    const path = this.pathBody(element.getAttribute('id'))
    console.log('highlight_top: ', path)
    this.findSupportingObj('children', path)
    this.findSupportingObj('parents', path)
    this.findSupportingObj('clicked', path) // dummy direction
  }

  setGraphNodeEventCallBack () {
    const self = this // alias to use event callback closure

    function makeTpInfoTable (path) {
      // path is always points node itself or parent of tp
      if (self.pathObjType(path) === 'tp') {
        path = self.nodePathFromTpPath(path)
      }
      const re = new RegExp(`^${path}`)
      const tpList = self.graph.tpTypeNodes().filter(d => d.path.match(re))
      self.tpInfoTable.selectAll('tr').remove() // clear tp info table
      self.tpInfoTable
        .append('tr')
        .append('th')
        .html('Term Point')
      self.tpInfoTable.selectAll('td')
        .data(tpList)
        .enter()
        .append('tr')
        .append('td')
        .attr('id', d => `${d.path}-tpinfo`)
        .attr('class', d => document.getElementById(d.path).classList) // copy from svg tp
        .on('mouseover', function () { mouseOver(this) })
        .on('mouseout', function () { mouseOut(this) })
        .on('click', function () { self.highlightNode(this) })
        .html(d => d.name)
    }

    function mouseOver (element) {
      const path = self.pathBody(element.id)

      // avoid loop: DO NOT make tp info table when the element is in tp info
      if (!(element.id.match(/-tpinfo$/))) {
        makeTpInfoTable(path)
      }

      // set highlight style
      for (const elm of self.highlightElementsByPath(path, 'select-ready')) {
        elm.classList.add('select-ready')
        // enable tooltip
        let tooltipBody = path // tooltip header
        const node = self.findGraphNodeByPath(path)
        if (node && Object.keys(node.attribute).length > 0) {
          tooltipBody = tooltipBody + node.attribute.toHtml()
        }
        self.tooltip
          .style('visibility', 'visible')
          .html(tooltipBody)
      }
    }

    function mouseMove (element) {
      self.tooltip
        .style('top', `${d3.event.pageY - 20}px`)
        .style('left', `${d3.event.pageX + 30}px`)
    }

    function mouseOut (element) {
      const path = self.pathBody(element.id)
      // remove highlight style
      for (const elm of self.highlightElementsByPath(path, 'select-ready')) {
        elm.classList.remove('select-ready')
        // disable tooltip
        self.tooltip
          .style('visibility', 'hidden')
      }
    }

    function fixElementsByPath (path) {
      const elements = self.highlightElementsByPath(path, 'fixed')
      if (self.pathObjType(path) === 'node') {
        // append circle of node itself to show 'fixed'
        elements.push(document.getElementById(path))
      }
      return elements
    }

    function classifyNodeAsFixed (element) {
      const path = self.pathBody(element.getAttribute('id'))
      for (const elm of fixElementsByPath(path)) {
        elm.classList.add('fixed')
      }
    }

    function unclassifyNodeAsFixed (element) {
      const path = self.pathBody(element.getAttribute('id'))
      for (const elm of fixElementsByPath(path)) {
        elm.classList.remove('fixed')
      }
    }

    function dblclick (d) {
      unclassifyNodeAsFixed(this)
      d.fx = null
      d.fy = null
    }

    function dragstarted (d) {
      classifyNodeAsFixed(this)
      if (!d3.event.active) {
        self.simulation.alphaTarget(0.3).restart()
      }
      d.fx = d.x
      d.fy = d.y
    }

    function dragged (d) {
      d.fx = d3.event.x
      d.fy = d3.event.y
    }

    function dragended (d) {
      if (!d3.event.active) {
        self.simulation.alphaTarget(0)
      }
    }

    // objects need to set event handler
    const nodeRelateObjs = [
      this.tp, this.node, this.nodeCircle, this.tpLabel, this.nodeLabel
    ]

    // set event callbacks for circle/labels that means node/tp
    for (const obj of nodeRelateObjs) {
      // use `function() {}` NOT arrow-function `() => {}`.
      // arrow-function bind `this` according to decrared position
      obj
        .on('click', function () { self.highlightNode(this) })
        .on('mouseover', function () { mouseOver(this) })
        .on('mousemove', function () { mouseMove(this) })
        .on('mouseout', function () { mouseOut(this) })
        .on('dblclick', dblclick)
        .call(d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended))
    }

    // set event callbacks for node info table
    this.nodeInfoTable.selectAll('td')
      .on('click', function () { self.highlightNode(this) })
      .on('mouseover', function () { mouseOver(this) })
      .on('mouseout', function () { mouseOut(this) })
  }

  setButtonEventCallback () {
    // click callbacks
    // NOTICE: bind 'this': this = OperationalVisualizer
    const clearHighlight = () => {
      // clear all highlighted object
      const classList = ['selected-children', 'selected-parents', 'selected']
      for (const cls of classList) {
        d3.selectAll('div#visualizer').selectAll(`.${cls}`)
          .classed(cls, false)
      }
    }

    const toggleDiffInactive = () => {
      const visualizer = d3.selectAll('div#visualizer')
      visualizer.selectAll(`.${this.currentInactive}`)
        .classed('inactive', false)
        .transition()
        .style('fill-opacity', 1.0)
        .style('stroke-opacity', 1.0)
        .duration(500)
      this.currentInactive = this.currentInactive === 'deleted' ? 'added' : 'deleted'
      visualizer.selectAll(`.${this.currentInactive}`)
        .classed('inactive', true)
        .transition()
        .style('fill-opacity', 0.2)
        .style('stroke-opacity', 0.1)
        .duration(500)
    }

    // add class to highlight 'button' text when mouse-over/out
    // NOTICE: dont bind `this`
    function mouseOverFunc () {
      this.classList.add('select-ready')
    }
    function mouseOutFunc () {
      this.classList.remove('select-ready')
    }

    // set event callback for clear button
    this.clearBtn
      .on('click', clearHighlight)
      .on('mouseover', mouseOverFunc)
      .on('mouseout', mouseOutFunc)

    // set event callback for diff active/inactive
    this.toggleBtn
      .on('click', toggleDiffInactive)
      .on('mouseover', mouseOverFunc)
      .on('mouseout', mouseOutFunc)
  }
}
