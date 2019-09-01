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
      .attr('x', d => d.x)
      .attr('y', d => d.y + d.height / 2)
      .attr('class', 'dep layer')
      .attr('font-size', this.fontSize)
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
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('width', d => d.width)
      .attr('height', d => d.height)
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
      .attr('cx', d => d.cx)
      .attr('cy', d => d.cy)
      .attr('r', d => d.r)
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
      .attr('x', d => d.x)
      .attr('y', d => d.y + d.height)
      .attr('dy', this.fontSize)
      .attr('font-size', this.fontSize)
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
      .attr('x', d => d.cx)
      .attr('y', d => d.cy + d.r)
      .attr('dy', this.fontSize / 2)
      .attr('font-size', this.fontSize)
      .text(d => d.name)
  }

  makeDepLineGroup () {
    return this.svgGrp.append('g').attr('class', 'dep-lines')
  }

  makeGraphObjects (graphData) {
    this.makeGraphSVG('dependency-view', null, 'whole-dep-graph')
    this.makeGraphControlButtons()

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
