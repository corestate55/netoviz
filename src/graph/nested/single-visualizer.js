import { select } from 'd3-selection'
import BaseContainer from '../../../srv/graph/base'
import InterTpLinkCreator from './link-creator'

export default class SingleNestedVisualizer extends BaseContainer {
  constructor () {
    super()
    // canvas size
    this.width = 800
    this.height = 600
    this.fontSize = 10
    this.gridStart = -100
    this.gridEnd = 2000
    this.gridHandleRadius = 25
  }

  clearCanvas () {
    // clear graphs
    select('div#visualizer') // clear all graphs
      .selectAll('div.network-layer')
      .remove()
  }

  makeNestedGraphSVG () {
    return select('body').select('div#visualizer')
      .append('div') // to keep compatibility with topology visualizer
      .attr('class', 'network-layer')
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
  }

  makeNestedGraphSVGGroup () {
    return this.svg.append('g')
      .attr('id', 'whole-dep-graph')
  }

  makeXGridHandles () {
    this.svgGrp.selectAll('circle.grid-x-handle')
      .data(this.xGrids)
      .enter()
      .append('circle')
      .attr('class', 'nest grid-x-handle')
      .attr('id', d => `grid-x${d.index}-handle`)
      .attr('cx', d => d.position)
      .attr('cy', this.gridStart)
      .attr('r', this.gridHandleRadius)
  }

  makeXGridLabels () {
    this.svgGrp.selectAll('text.grid-x-handle')
      .data(this.xGrids)
      .enter()
      .append('text')
      .attr('class', 'nest grid-x-handle')
      .attr('id', d => `grid-x${d.index}-label`)
      .attr('x', d => d.position)
      .attr('y', this.gridStart)
      .text(d => d.index)
  }

  makeXGridLines () {
    this.svgGrp.selectAll('line.grid-x')
      .data(this.xGrids)
      .enter()
      .append('line')
      .attr('class', 'nest grid-x')
      .attr('id', d => `grid-x${d.index}`)
      .attr('x1', d => d.position)
      .attr('y1', this.gridStart)
      .attr('x2', d => d.position)
      .attr('y2', this.gridEnd)
  }

  makeXGrids (xGridData) {
    this.xGrids = xGridData.map((d, i) => {
      return { position: d, index: i }
    })
    this.makeXGridLines()
    this.makeXGridHandles()
    this.makeXGridLabels()
  }

  makeYGridHandles () {
    this.svgGrp.selectAll('circle.grid-y-handle')
      .data(this.yGrids)
      .enter()
      .append('circle')
      .attr('class', 'nest grid-y-handle')
      .attr('id', d => `grid-y${d.index}-handle`)
      .attr('cx', this.gridStart)
      .attr('cy', d => d.position)
      .attr('r', this.gridHandleRadius)
  }

  makeYGridLabels () {
    this.svgGrp.selectAll('text.grid-y-handle')
      .data(this.yGrids)
      .enter()
      .append('text')
      .attr('class', 'nest grid-y-handle')
      .attr('id', d => `grid-y${d.index}-label`)
      .attr('x', this.gridStart)
      .attr('y', d => d.position)
      .text(d => d.index)
  }

  makeYGridLines () {
    this.svgGrp.selectAll('line.grid-y')
      .data(this.yGrids)
      .enter()
      .append('line')
      .attr('class', 'nest grid-y')
      .attr('id', (d) => `grid-y${d.index}`)
      .attr('x1', this.gridStart)
      .attr('y1', d => d.position)
      .attr('x2', this.gridEnd)
      .attr('y2', d => d.position)
  }

  makeYGrids (yGridData) {
    this.yGrids = yGridData.map((d, i) => {
      return { position: d, index: i }
    })
    this.makeYGridLines()
    this.makeYGridHandles()
    this.makeYGridLabels()
  }

  layerOf (node) {
    return node.path.split('/').shift()
  }

  colorOfNode (node) {
    return this.colorTable[this.layerOf(node)]
  }

  makeColorTable (nodes) {
    const colors = [
      '#e1f1e0',
      '#d5e5d5',
      '#F9FBB2',
      '#F8FCDA',
      '#e3e9c2'
    ]
    let colorTable = {}
    const layerNameList = nodes.map(node => this.layerOf(node))
    Array.from(new Set(layerNameList)) // Array.uniq
      .forEach((d, i) => {
        colorTable[d] = colors[i % colors.length]
      })
    return colorTable
  }

  makeNodes (nodes) {
    this.svgGrp.selectAll('rect.node')
      .data(nodes)
      .enter()
      .append('rect')
      .attr('class', 'nest node')
      .attr('id', d => d.path)
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('width', d => d.width)
      .attr('height', d => d.height)
      .attr('rx', 5)
      .attr('ry', 5)
      .style('fill', d => this.colorOfNode(d))
      .append('title')
      .text(d => d.path)
  }

  makeSupportTpLines (supportTpLinks) {
    this.svgGrp.selectAll('line.support-tp')
      .data(supportTpLinks)
      .enter()
      .append('line')
      .attr('class', d => `nest  ${d.type}`)
      .attr('id', d => d.path)
      .attr('x1', d => d.x1)
      .attr('y1', d => d.y1)
      .attr('x2', d => d.x2)
      .attr('y2', d => d.y2)
  }

  makeTpTpLines (tpTpLinks) {
    this.svgGrp.selectAll('polyline.tp-tp')
      .data(tpTpLinks)
      .enter()
      .append('polyline')
      .attr('class', d => `nest ${d.type}`)
      .attr('id', d => d.path)
      .attr('points', d => d.polylineString())
  }

  makeTp (tps) {
    this.svgGrp.selectAll('circle.tp')
      .data(tps)
      .enter()
      .append('circle')
      .attr('class', 'nest tp')
      .attr('id', d => d.path)
      .attr('cx', d => d.cx)
      .attr('cy', d => d.cy)
      .attr('r', d => d.r)
      .append('title')
      .text(d => d.path)
  }

  makeNodeLabels (nodes) {
    this.svgGrp.selectAll('text.node')
      .data(nodes)
      .enter()
      .append('text')
      .attr('class', 'nest node')
      .attr('id', d => d.path)
      .attr('x', d => d.x)
      .attr('y', d => d.y + d.height)
      .text(d => d.name)
  }

  makeTpLabels (tps) {
    this.svgGrp.selectAll('text.tp')
      .data(tps)
      .enter()
      .append('text')
      .attr('class', 'nest tp')
      .attr('id', d => d.path)
      .attr('x', d => d.cx)
      .attr('y', d => d.cy)
      .attr('dy', d => d.r)
      .text(d => d.name)
  }

  makeGraphObjects (graphData) {
    this.svg = this.makeNestedGraphSVG()
    this.svgGrp = this.makeNestedGraphSVGGroup()

    this.makeXGrids(graphData.grid.x)
    this.makeYGrids(graphData.grid.y)

    const nodes = graphData.nodes.filter(d => d.type === 'node')
    this.colorTable = this.makeColorTable(nodes)
    this.makeNodes(nodes)

    const linkCreator = new InterTpLinkCreator(graphData)
    this.makeSupportTpLines(linkCreator.supportTpLinks())
    this.makeTpTpLines(linkCreator.tpTpLinks())

    const tps = graphData.nodes.filter(d => d.type === 'tp')
    this.makeTp(tps)

    this.makeNodeLabels(nodes)
    this.makeTpLabels(tps)
  }
}
