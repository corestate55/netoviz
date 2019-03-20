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

  makeXGrids (xGridData) {
    const xGrids = xGridData.map((d, i) => {
      return { position: d, index: i }
    })
    this.svgGrp.selectAll('line.grid-x')
      .data(xGrids)
      .enter()
      .append('line')
      .attr('class', 'grid-x')
      .attr('id', d => `grid-x${d.index}`)
      .attr('x1', d => d.position)
      .attr('y1', this.gridStart)
      .attr('x2', d => d.position)
      .attr('y2', this.gridEnd)
    this.svgGrp.selectAll('circle.grid-x-handle')
      .data(xGrids)
      .enter()
      .append('circle')
      .attr('class', 'grid-x-handle')
      .attr('id', d => `grid-x${d.index}-handle`)
      .attr('cx', d => d.position)
      .attr('cy', this.gridStart)
      .attr('r', this.gridHandleRadius)
  }

  makeYGrids (yGridData) {
    const yGrids = yGridData.map((d, i) => {
      return { position: d, index: i }
    })
    this.svgGrp.selectAll('line.grid-y')
      .data(yGrids)
      .enter()
      .append('line')
      .attr('class', 'grid-y')
      .attr('id', (d) => `grid-y${d.index}`)
      .attr('x1', this.gridStart)
      .attr('y1', d => d.position)
      .attr('x2', this.gridEnd)
      .attr('y2', d => d.position)
    this.svgGrp.selectAll('circle.grid-y-handle')
      .data(yGrids)
      .enter()
      .append('circle')
      .attr('class', 'grid-y-handle')
      .attr('id', d => `grid-y${d.index}-handle`)
      .attr('cx', this.gridStart)
      .attr('cy', d => d.position)
      .attr('r', this.gridHandleRadius)
  }

  makeNodes (nodes) {
    this.svgGrp.selectAll('rect.node')
      .data(nodes)
      .enter()
      .append('rect')
      .attr('class', 'node')
      .attr('id', d => d.path)
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('width', d => d.width)
      .attr('height', d => d.height)
      .attr('rx', 5)
      .attr('ry', 5)
      .append('title')
      .text(d => d.path)
  }

  makeSupportTpLines (supportTpLinks) {
    this.svgGrp.selectAll('line.support-tp')
      .data(supportTpLinks)
      .enter()
      .append('line')
      .attr('class', d => d.type)
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
      .attr('class', d => d.type)
      .attr('id', d => d.path)
      .attr('points', d => d.polylineString())
  }

  makeTp (tps) {
    this.svgGrp.selectAll('circle.tp')
      .data(tps)
      .enter()
      .append('circle')
      .attr('class', 'tp')
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
      .attr('class', 'node')
      .attr('id', d => d.path)
      .attr('x', d => d.x)
      .attr('y', d => d.y + d.height)
      .attr('alignment-baseline', 'hanging')
      .text(d => d.name)
  }

  makeTpLabels (tps) {
    this.svgGrp.selectAll('text.tp')
      .data(tps)
      .enter()
      .append('text')
      .attr('class', 'tp')
      .attr('id', d => d.path)
      .attr('x', d => d.cx)
      .attr('y', d => d.cy + d.r)
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'hanging')
      .text(d => d.name)
  }

  makeGraphObjects (graphData) {
    this.svg = this.makeNestedGraphSVG()
    this.svgGrp = this.makeNestedGraphSVGGroup()

    this.makeXGrids(graphData.grid.x)
    this.makeYGrids(graphData.grid.y)

    const nodes = graphData.nodes.filter(d => d.type === 'node')
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
