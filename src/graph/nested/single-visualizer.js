import { select } from 'd3-selection'
import BaseContainer from '../../../srv/graph/base'

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

    this.svgGrp.selectAll('rect')
      .data(nodes)
      .enter()
      .append('rect')
      .attr('id', d => d.path)
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('width', d => d.width)
      .attr('height', d => d.height)

    this.svgGrp.selectAll('circle')
      .data(tps)
      .enter()
      .append('circle')
      .attr('id', d => d.path)
      .attr('cx', d => d.cx)
      .attr('cy', d => d.cy)
      .attr('r', d => d.r)
  }
}
