import { select } from 'd3-selection'
import { scaleLinear } from 'd3-scale'
import BaseContainer from '../../srv/base'

export default class SingleDepGraphVisualizer extends BaseContainer {
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

  makeDepGraphSVG () {
    return select('body').select('div#visualizer')
      .append('div') // to keep compatibility with topology visualizer
      .attr('class', 'network-layer')
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
  }

  makeDepGraphSVGGroup () {
    return this.svg.append('g')
      .attr('id', 'whole-dep-graph')
  }

  makeLayerGroup () {
    return this.svgGrp.append('g')
      .attr('class', 'layer-labels')
  }

  makeClearButton () {
    const clearButtonFontSize = 12
    return this.svg.append('text')
      .attr('class', 'dep')
      .attr('x', clearButtonFontSize / 2)
      .attr('y', clearButtonFontSize)
      .text('[clear highlight]')
  }

  makeLayerLabel (graphData, origin) {
    return origin.selectAll('text')
      .data(graphData)
      .enter()
      .append('text')
      .attr('x', d => this.scale(d.x))
      .attr('y', d => this.scale(d.y + d.height / 2))
      .attr('class', 'dep layer')
      .text(d => d.name)
  }

  makeLayerObjGroup () {
    return this.svgGrp.append('g')
      .attr('class', 'layer-objects')
  }

  makeLayerNode (layer, origin) {
    return origin.selectAll('rect')
      .data(layer.nodes)
      .enter()
      .append('rect')
      .attr('class', 'dep')
      .attr('id', d => d.path)
      .attr('x', d => this.scale(d.x))
      .attr('y', d => this.scale(d.y))
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('width', d => this.scale(d.width))
      .attr('height', d => this.scale(d.height))
      // .append('title')
      // .text(d => d.path)
  }

  makeLayerNodeTp (layer, origin) {
    return origin.selectAll('circle')
      .data(layer.tps)
      .enter()
      .append('circle')
      .attr('class', 'dep')
      .attr('id', d => d.path)
      .attr('cx', d => this.scale(d.cx))
      .attr('cy', d => this.scale(d.cy))
      .attr('r', d => this.scale(d.r))
      // .append('title')
      // .text(d => d.path)
  }

  makeLayerNodeLabel (layer, origin) {
    return origin.selectAll('text.node')
      .data(layer.nodes)
      .enter()
      .append('text')
      .attr('class', 'dep node')
      .attr('id', d => `${d.path}-ndlb`)
      .attr('x', d => this.scale(d.x))
      .attr('y', d => this.scale(d.y + d.height))
      .attr('dy', this.fontSize)
      .text(d => d.name)
  }

  makeLayerNodeTpLabel (layer, origin) {
    return origin.selectAll('text.tp')
      .data(layer.tps)
      .enter()
      .append('text')
      .attr('class', 'dep tp')
      .attr('id', d => `${d.path}-tplb`)
      .attr('x', d => this.scale(d.cx))
      .attr('y', d => this.scale(d.cy + d.r))
      .attr('dy', this.fontSize / 2)
      .text(d => d.name)
  }

  makeArrowEnd (defs, arrowId, arrowClass) {
    const size = this.scale(4)
    const linePath = `M 0,0 V ${size} L${size},${size / 2} Z`
    defs.append('marker')
      .attr('id', arrowId)
      .attr('class', arrowClass)
      .attr('refX', size)
      .attr('refY', size / 2)
      .attr('markerWidth', size)
      .attr('markerHeight', size)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', linePath)
  }

  makeDepArrowEndDefs () {
    const defs = this.svg.append('defs')
    this.makeArrowEnd(defs, 'node-dep-arrow-end', 'dep node')
    this.makeArrowEnd(defs, 'tp-dep-arrow-end', 'dep tp')
  }

  makeDepLineGroup () {
    return this.svgGrp.append('g')
      .attr('class', 'dep-lines')
  }

  makeScale (graphData) {
    const lastNodes = graphData.map(layer => layer.nodes[layer.nodes.length - 1])
    // Use single scale to use to objects,
    // because to KEEP aspect ratio of original object.
    const maxX = Math.max(...lastNodes.map(n => n.x + n.width))
    const maxY = Math.max(...lastNodes.map(n => n.y + n.height + this.fontSize * 2))
    const scaleX = scaleLinear()
      .domain([0, maxX])
      .range([0, this.width])
    if (scaleX(maxY) < this.height) {
      // the last layer node did not run-off the canvas when fit by width
      return scaleX
    }
    // else return scaleY (fit by height)
    return scaleLinear()
      .domain([0, maxY])
      .range([0, this.height])
  }

  makeGraphObjects (graphData) {
    this.svg = this.makeDepGraphSVG()
    this.svgGrp = this.makeDepGraphSVGGroup()
    this.clearButton = this.makeClearButton()
    this.scale = this.makeScale(graphData)

    // for each layer
    const layerLabelGroup = this.makeLayerGroup()
    this.makeLayerLabel(graphData, layerLabelGroup)

    // for each node/tp
    for (const layer of graphData) {
      const layerObjGroup = this.makeLayerObjGroup()
      this.makeLayerNode(layer, layerObjGroup)
      this.makeLayerNodeTp(layer, layerObjGroup)
      this.makeLayerNodeLabel(layer, layerObjGroup)
      this.makeLayerNodeTpLabel(layer, layerObjGroup)
    }
    // for dependency line
    // NOTICE priority: lines at upper object
    this.depLineGrp = this.makeDepLineGroup()
    this.makeDepArrowEndDefs()
  }
}
