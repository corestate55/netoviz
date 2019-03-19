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

  makeGraphObjects (graphData) {
    this.svg = this.makeNestedGraphSVG()
    this.svgGrp = this.makeNestedGraphSVGGroup()

    const nodes = graphData.nodes.filter(d => d.type === 'node')
    const tps = graphData.nodes.filter(d => d.type === 'tp')

    this.svgGrp.selectAll('line.grid-x')
      .data(graphData.grid.x)
      .enter()
      .append('line')
      .attr('class', 'grid-x')
      .attr('x1', d => d)
      .attr('y1', -100)
      .attr('x2', d => d)
      .attr('y2', 2000)

    this.svgGrp.selectAll('line.grid-y')
      .data(graphData.grid.y)
      .enter()
      .append('line')
      .attr('class', 'grid-y')
      .attr('x1', -100)
      .attr('y1', d => d)
      .attr('x2', 2000)
      .attr('y2', d => d)

    // node
    this.svgGrp.selectAll('rect')
      .data(nodes)
      .enter()
      .append('rect')
      .attr('id', d => d.path)
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('width', d => d.width)
      .attr('height', d => d.height)
      .attr('rx', 5)
      .attr('ry', 5)
      .append('title')
      .text(d => d.path)

    // lines
    const linkCreator = new InterTpLinkCreator(graphData)
    this.svgGrp.selectAll('line.support-tp')
      .data(linkCreator.supportTpLinks())
      .enter()
      .append('line')
      .attr('class', d => d.type)
      .attr('x1', d => d.x1)
      .attr('y1', d => d.y1)
      .attr('x2', d => d.x2)
      .attr('y2', d => d.y2)

    this.svgGrp.selectAll('polyline.tp-tp')
      .data(linkCreator.tpTpLinks())
      .enter()
      .append('polyline')
      .attr('class', d => d.type)
      .attr('id', d => d.path)
      .attr('points', d => d.polylineString())

    // tp
    this.svgGrp.selectAll('circle')
      .data(tps)
      .enter()
      .append('circle')
      .attr('id', d => d.path)
      .attr('cx', d => d.cx)
      .attr('cy', d => d.cy)
      .attr('r', d => d.r)
      .append('title')
      .text(d => d.path)

    // node label
    this.svgGrp.selectAll('text.node')
      .data(nodes)
      .enter()
      .append('text')
      .attr('class', 'node')
      .attr('x', d => d.x)
      .attr('y', d => d.y + d.height)
      .attr('alignment-baseline', 'hanging')
      .text(d => d.name)

    // tp label
    this.svgGrp.selectAll('text.tp')
      .data(tps)
      .enter()
      .append('text')
      .attr('class', 'tp')
      .attr('x', d => d.cx)
      .attr('y', d => d.cy + d.r)
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'hanging')
      .text(d => d.name)
  }
}
