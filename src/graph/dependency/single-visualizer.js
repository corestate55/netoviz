import { scaleLinear } from 'd3-scale'
import SingleVisualizerBase from '../common/single-visualizer-base'

export default class SingleDepGraphVisualizer extends SingleVisualizerBase {
  constructor (width, height) {
    super()
    // canvas size
    this.width = width
    this.height = height
    // constants
    this.fontSize = 20
  }

  makeLayerGroup () {
    return this.svgGrp.append('g').attr('class', 'layer-labels')
  }

  makeLayerLabel (graphData, origin) {
    return origin
      .selectAll('text')
      .data(graphData)
      .enter()
      .append('text')
      .attr('x', d => this.scale(d.x))
      .attr('y', d => this.scale(d.y + d.height / 2))
      .attr('class', 'dep layer')
      .attr('font-size', this.scale(this.fontSize))
      .text(d => d.name)
  }

  makeLayerObjGroup () {
    return this.svgGrp.append('g').attr('class', 'layer-objects')
  }

  makeLayerNode (layer, origin) {
    return origin
      .selectAll('rect')
      .data(layer.nodes)
      .enter()
      .append('rect')
      .attr('class', d => this.objClassDef(d, 'dep'))
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
    return origin
      .selectAll('circle')
      .data(layer.tps)
      .enter()
      .append('circle')
      .attr('class', d => this.objClassDef(d, 'dep'))
      .attr('id', d => d.path)
      .attr('cx', d => this.scale(d.cx))
      .attr('cy', d => this.scale(d.cy))
      .attr('r', d => this.scale(d.r))
    // .append('title')
    // .text(d => d.path)
  }

  makeLayerNodeLabel (layer, origin) {
    return origin
      .selectAll('text.node')
      .data(layer.nodes)
      .enter()
      .append('text')
      .attr('class', d => this.objClassDef(d, 'dep node'))
      .attr('id', d => `${d.path}-ndlb`)
      .attr('x', d => this.scale(d.x))
      .attr('y', d => this.scale(d.y + d.height))
      .attr('dy', this.scale(this.fontSize))
      .attr('font-size', this.scale(this.fontSize))
      .text(d => d.name)
  }

  makeLayerNodeTpLabel (layer, origin) {
    return origin
      .selectAll('text.tp')
      .data(layer.tps)
      .enter()
      .append('text')
      .attr('class', d => this.objClassDef(d, 'dep tp'))
      .attr('id', d => `${d.path}-tplb`)
      .attr('x', d => this.scale(d.cx))
      .attr('y', d => this.scale(d.cy + d.r))
      .attr('dy', this.scale(this.fontSize / 2))
      .attr('font-size', this.scale(this.fontSize))
      .text(d => d.name)
  }

  makeDepLineGroup () {
    return this.svgGrp.append('g').attr('class', 'dep-lines')
  }

  makeScale (graphData) {
    const lastNodes = graphData.map(
      layer => layer.nodes[layer.nodes.length - 1]
    )
    // Use single scale to use to objects,
    // because to KEEP aspect ratio of original object.
    const maxX = Math.max(...lastNodes.map(n => n.x + n.width))
    const maxY = Math.max(
      ...lastNodes.map(n => n.y + n.height + this.fontSize * 2)
    )
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
    this.makeGraphSVG('dependency-view', null, 'whole-dep-graph')
    this.makeGraphControlButtons()
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
  }
}
