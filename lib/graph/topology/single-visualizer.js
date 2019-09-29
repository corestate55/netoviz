'use strict'

import { select, selectAll } from 'd3-selection'
import SingleVisualizerBase from '../common/single-visualizer-base'

export default class SingleGraphVisualizer extends SingleVisualizerBase {
  constructor(graph, findAllNodeFunc) {
    super()
    this.graph = graph
    this.setCavasSize()
    // set callback to find node through all layers
    this.findGraphNodeByPath = findAllNodeFunc
    // rename link key
    this.renameLinkKey()
    // diff view mode default
    this.currentInactive = 'deleted'
    // make each objects
    this.makeGraphSVG(
      this.graph.name,
      this.objClassDef(this.graph, 'network'),
      `${this.graph.name}-group`
    )
    this.makeGraphControlButtons()
    this.link = this.makeLinkObjects()
    this.nodeCircle = this.makeNodeCircleObjects()
    this.node = this.makeNodeObjects()
    this.tp = this.makeTpObjects()
    this.tpLabel = this.makeTpLabelObjects()
    this.nodeLabel = this.makeNodeLabelObjects()
    // setup info table
    this.makeInfoTable()
    // set style of initial inactive objects
    this.setStyleOfInactiveObjects()
  }

  tpTypeNodes() {
    return this.graph.nodes.filter(d => d.type === 'tp')
  }

  nodeTypeNodes() {
    return this.graph.nodes.filter(d => d.type === 'node')
  }

  makeInfoTable() {
    const tableContainer = this.visContainer
      .append('div')
      .attr('class', 'info-tables')
    this.makeNodeInfoTable(tableContainer)
    this.makeTpInfoTable(tableContainer)
  }

  makeNodeInfoTable(tableContainer) {
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

  makeTpInfoTable(tableContainer) {
    this.tpInfoTable = tableContainer
      .append('table')
      .attr('class', 'tp-info-table')
    this.tpInfoTable
      .append('tr')
      .append('th')
      .html('Term Point')
  }

  makeVisContainer() {
    // override
    this.visContainer = select('body')
      .select('div#visualizer')
      .append('div')
      .attr('class', 'network-layer')
      .attr('id', `${this.graph.name}-container`)
      .style('display', 'block')
      .html(`<p>${this.graph.name}</p>`)
    return this.visContainer
  }

  makeLinkObjects() {
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

  makeTpObjects() {
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
    )
  }

  makeNodeObjects() {
    return this.svgGrp
      .append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(this.nodeTypeNodes())
      .enter()
      .append('circle')
      .attr('class', d => this.objClassDef(d, 'topo node'))
      .attr('id', d => d.path)
  }

  makeNodeCircleObjects() {
    return this.svgGrp
      .append('g')
      .attr('class', 'node-circles')
      .selectAll('circle.node-circle')
      .data(this.nodeTypeNodes())
      .enter()
      .append('circle')
      .attr('class', d => this.objClassDef(d, 'topo node-circle'))
      .attr('id', d => `${d.path}-bg`) // background
  }

  makeTpLabelObjects() {
    return this.svgGrp
      .append('g')
      .attr('class', 'tp-labels')
      .selectAll('text.tp-label')
      .data(this.tpTypeNodes())
      .enter()
      .append('text')
      .attr('class', d => this.objClassDef(d, 'topo tp-label'))
      .attr('id', d => `${d.path}-tplb`) // tp label
      .text(d => d.name)
  }

  makeNodeLabelObjects() {
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

  setCavasSize() {
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

  setStyleOfInactiveObjects() {
    selectAll(`.${this.currentInactive}`).classed('inactive', true)
  }

  renameLinkKey() {
    for (const d of this.graph.links) {
      d.source = d.sourceId
      d.target = d.targetId
    }
  }
}
