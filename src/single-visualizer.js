'use strict'

import * as d3 from 'd3'

export class SingleGraphVisualizer {
  constructor (graph, findAllNodeFunc) {
    this.graph = graph
    this.setCavasSize()
    // set callback to find node through all layers
    this.findGraphNodeByPath = findAllNodeFunc
    // rename link key
    this.renameLinkKey()
    // diff view mode default
    this.currentInactive = 'deleted'
    // make each objects
    this.visContainer = this.makeVisContainer()
    this.nwLayerSvg = this.makeNetworkLayerSVG()
    this.nwLayer = this.makeNetworkLayer()
    this.clearBtn = this.makeClearButton()
    this.toggleBtn = this.makeDiffInactiveToggleButton()
    this.link = this.makeLinkObjects()
    this.nodeCircle = this.makeNodeCircleObjects()
    this.node = this.makeNodeObjects()
    this.tp = this.makeTpObjects()
    this.tpLabel = this.makeTpLabelObjects()
    this.nodeLabel = this.makeNodeLabelObjects()
    // setup info table
    this.makeInfoTable()
    // add tool tip
    this.tooltip = this.makeToolTip()
    // set style of initial inactive objects
    this.setStyleOfInactiveObjects()
  }

  objClassDef (obj, classString) {
    const objState = obj.diffState.detect()
    const list = [classString, objState]
    if (objState === this.currentInactive) {
      list.push('inactive')
    }
    return list.join(' ')
  }

  makeToolTip () {
    return this.visContainer
      .append('div')
      .classed('tooltip', true)
      .classed('pop-down', true)
  }

  makeInfoTable () {
    const tableContainer = this.visContainer
      .append('div')
      .attr('class', 'info-tables')
    this.makeNodeInfoTable(tableContainer)
    this.makeTpInfoTable(tableContainer)
  }

  makeNodeInfoTable (tableContainer) {
    this.nodeInfoTable = tableContainer
      .append('table')
      .attr('class', 'node-info-table')
    this.nodeInfoTable
      .append('tr') // table header
      .append('th')
      .html('Node')
    this.nodeInfoTable.selectAll('td')
      .data(this.graph.nodeTypeNodes())
      .enter()
      .append('tr')
      .append('td')
      .attr('id', d => `${d.path}-ndinfo`)
      .html(d => d.name)
  }

  makeTpInfoTable (tableContainer) {
    this.tpInfoTable = tableContainer
      .append('table')
      .attr('class', 'tp-info-table')
  }

  makeVisContainer () {
    return d3.select('body')
      .select('div#visualizer')
      .append('div')
      .attr('class', 'network-layer')
      .attr('id', `${this.graph.name}-container`)
      .style('display', 'block')
      .html(`<p>${this.graph.name}</p>`)
  }

  makeNetworkLayerSVG () {
    return this.visContainer
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('id', this.graph.name)
      .attr('class', this.objClassDef(this.graph, 'network'))
  }

  makeNetworkLayer () {
    return this.nwLayerSvg
      .append('g')
      .attr('id', `${this.graph.name}-group`)
  }

  makeClearButton () {
    return this.nwLayerSvg
      .append('text')
      .attr('x', 10)
      .attr('y', 20)
      .attr('class', 'clear-button')
      .text('[clear all selection/highlight]')
  }

  makeDiffInactiveToggleButton () {
    return this.nwLayerSvg
      .append('text')
      .attr('x', 10)
      .attr('y', 40)
      .attr('class', 'diff-toggle-button')
      .text('[toggle diff added/deleted]')
  }

  makeLinkObjects () {
    return this.nwLayer.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(this.graph.links)
      .enter()
      .append('line')
      .attr('id', d => d.path)
      .attr('class', d => this.objClassDef(d, 'link'))
  }

  makeTpObjects () {
    return this.nwLayer.append('g')
      .attr('class', 'term-points')
      .selectAll('circle.tp')
      .data(this.graph.tpTypeNodes())
      .enter()
      .append('circle')
      .attr('class', d => this.objClassDef(d, 'tp'))
      // d => ['tp', d.diffState.detect()].join(' ')
      .attr('id', d => d.path)
  }

  makeNodeObjects () {
    return this.nwLayer.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(this.graph.nodeTypeNodes())
      .enter()
      .append('circle')
      .attr('class', d => this.objClassDef(d, 'node'))
      .attr('id', d => d.path)
  }

  makeNodeCircleObjects () {
    return this.nwLayer.append('g')
      .attr('class', 'node-circles')
      .selectAll('circle.node-circle')
      .data(this.graph.nodeTypeNodes())
      .enter()
      .append('circle')
      .attr('class', d => this.objClassDef(d, 'node-circle'))
      .attr('id', d => `${d.path}-bg`) // background
  }

  makeTpLabelObjects () {
    return this.nwLayer.append('g')
      .attr('class', 'tp-labels')
      .selectAll('text.tp-label')
      .data(this.graph.tpTypeNodes())
      .enter()
      .append('text')
      .attr('class', d => this.objClassDef(d, 'tp-label'))
      .attr('id', d => `${d.path}-tplb`) // tp label
      .text(d => d.name)
  }

  makeNodeLabelObjects () {
    return this.nwLayer.append('g')
      .attr('class', 'node-labels')
      .selectAll('text.node-label')
      .data(this.graph.nodeTypeNodes())
      .enter()
      .append('text')
      .attr('class', d => this.objClassDef(d, 'node-label'))
      .attr('id', d => `${d.path}-ndlb`) // node label
      .text(d => d.name)
  }

  setCavasSize () {
    const graphSize = this.graph.nodes.length
    if (graphSize > 50) {
      // large
      this.width = 600
      this.height = 600
    } else if (graphSize >= 20 && graphSize < 50) {
      // medium
      this.width = 450
      this.height = 450
    } else {
      // small
      this.width = 300
      this.height = 300
    }
  }

  setStyleOfInactiveObjects () {
    d3.selectAll(`.${this.currentInactive}`)
      .classed('inactive', true)
  }

  renameLinkKey () {
    for (const d of this.graph.links) {
      d.source = d.sourceId
      d.target = d.targetId
    }
  }
}
