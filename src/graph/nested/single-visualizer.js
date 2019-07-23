import { select } from 'd3-selection'
import { scaleLinear } from 'd3-scale'
import SingleVisualizerBase from '../common/single-visualizer-base'
import InterTpLinkCreator from './link-creator'

export default class SingleNestedVisualizer extends SingleVisualizerBase {
  constructor () {
    super()
    // canvas size
    this.width = 800
    this.height = 600
    this.gridStart = -100
    this.gridEnd = 2000
    this.gridHandleRadius = 25
    this.fontSize = 15
    this.gridFontSize = 25
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

  selectXY (xy, a, b) {
    const selectedValue = xy === 'x' ? a : b
    if (Array.isArray(selectedValue)) {
      return selectedValue
    }
    return this.scale(selectedValue) // single value
  }

  makeGridHandles (xy) {
    this.svgGrp.selectAll(`circle.grid-${xy}-handle`)
      .data(this.selectXY(xy, this.xGrids, this.yGrids))
      .enter()
      .append('circle')
      .attr('class', `nest grid-${xy}-handle`)
      .attr('id', d => `grid-${xy}${d.index}-handle`)
      .attr('cx', d => this.selectXY(xy, d.position, this.gridStart))
      .attr('cy', d => this.selectXY(xy, this.gridStart, d.position))
      .attr('r', this.scale(this.gridHandleRadius))
  }

  makeGridLines (xy) {
    this.svgGrp.selectAll(`line.grid-${xy}`)
      .data(this.selectXY(xy, this.xGrids, this.yGrids))
      .enter()
      .append('line')
      .attr('class', `nest grid-${xy}`)
      .attr('id', d => `grid-${xy}${d.index}`)
      .attr('x1', d => this.selectXY(xy, d.position, this.gridStart))
      .attr('y1', d => this.selectXY(xy, this.gridStart, d.position))
      .attr('x2', d => this.selectXY(xy, d.position, this.gridEnd))
      .attr('y2', d => this.selectXY(xy, this.gridEnd, d.position))
      .attr('stroke-width', this.scale(1))
      .attr('stroke-dasharray', this.scale(5))
  }

  makeGridLabels (xy) {
    this.svgGrp.selectAll(`text.grid-${xy}-handle`)
      .data(this.selectXY(xy, this.xGrids, this.yGrids))
      .enter()
      .append('text')
      .attr('class', `nest grid-${xy}-handle`)
      .attr('id', d => `grid-${xy}${d.index}-label`)
      .attr('x', d => this.selectXY(xy, d.position, this.gridStart))
      .attr('y', d => this.selectXY(xy, this.gridStart, d.position))
      .attr('dy', this.scale(this.gridFontSize / 2)) // vertical center
      .attr('font-size', this.scale(this.gridFontSize))
      .text(d => d.index)
  }

  gridObjectsFrom (gridData) {
    return gridData.map((d, i) => {
      return { position: d, index: i }
    })
  }

  makeGrids (xy) {
    this.makeGridLines(xy)
    this.makeGridHandles(xy)
    this.makeGridLabels(xy)
  }

  layerOf (node) {
    return node.path.split('__').shift()
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
      .attr('class', d => this.objClassDef(d, 'nest node'))
      .attr('id', d => d.path)
      .attr('x', d => this.scale(d.x))
      .attr('y', d => this.scale(d.y))
      .attr('width', d => this.scale(d.width))
      .attr('height', d => this.scale(d.height))
      .attr('rx', 5)
      .attr('ry', 5)
      .style('fill', d => this.colorOfNode(d))
  }

  makeSupportTpLines (supportTpLinks) {
    const updatedLines = this.svgGrp.selectAll('line.support-tp')
      .data(supportTpLinks)
    const enteredLines = updatedLines
      .enter()
      .append('line')
    const targetLines = enteredLines.merge(updatedLines)
    targetLines
      .attr('class', d => `nest ${d.type}`) // support-tp line does not have diffState
      .attr('id', d => d.path)
      .attr('x1', d => this.scale(d.x1))
      .attr('y1', d => this.scale(d.y1))
      .attr('x2', d => this.scale(d.x2))
      .attr('y2', d => this.scale(d.y2))
      .attr('stroke-width', this.scale(4))
      .attr('stroke-dasharray', this.scale(4))
  }

  makeTpTpLines (tpTpLinks) {
    const updatedLines = this.svgGrp.selectAll('polyline.tp-tp')
      .data(tpTpLinks)
    const enteredLines = updatedLines
      .enter()
      .append('polyline')
    const targetLines = enteredLines.merge(updatedLines)
    targetLines
      .attr('class', d => this.objClassDef(d, `nest ${d.type}`))
      .attr('id', d => d.path)
      .attr('points', d => d.polylineString(this.scale))
      .attr('stroke-width', this.scale(4))
  }

  makeTp (tps) {
    this.svgGrp.selectAll('circle.tp')
      .data(tps)
      .enter()
      .append('circle')
      .attr('class', d => this.objClassDef(d, 'nest tp'))
      .attr('id', d => d.path)
      .attr('cx', d => this.scale(d.cx))
      .attr('cy', d => this.scale(d.cy))
      .attr('r', d => this.scale(d.r))
  }

  makeNodeLabels (nodes) {
    this.svgGrp.selectAll('text.node')
      .data(nodes)
      .enter()
      .append('text')
      .attr('class', d => this.objClassDef(d, 'nest node'))
      .attr('id', d => d.path)
      .attr('x', d => this.scale(d.x))
      .attr('y', d => this.scale(d.y + d.height))
      .attr('dy', this.scale(this.fontSize))
      .attr('font-size', this.scale(this.fontSize))
      .text(d => d.name)
  }

  makeTpLabels (tps) {
    this.svgGrp.selectAll('text.tp')
      .data(tps)
      .enter()
      .append('text')
      .attr('class', d => this.objClassDef(d, 'nest tp'))
      .attr('id', d => d.path)
      .attr('x', d => this.scale(d.cx))
      .attr('y', d => this.scale(d.cy + d.r))
      .attr('dy', this.scale(this.fontSize))
      .attr('font-size', this.scale(this.fontSize))
      .text(d => d.name)
  }

  makeScale (nodes) {
    const xMax = Math.max(...nodes.map(d => d.x + d.width))
    const yMax = Math.max(...nodes.map(d => d.y + d.height))
    const xScale = scaleLinear()
      .domain([0, xMax])
      .range([0, this.width])
    if (xScale(yMax) < this.height) {
      return xScale
    }
    return scaleLinear()
      .domain([0, yMax])
      .range([0, this.height])
  }

  makeGraphObjects (graphData) {
    this.svg = this.makeNestedGraphSVG()
    this.svgGrp = this.makeNestedGraphSVGGroup()
    this.tooltip = this.makeToolTip(select('body').select('div#visualizer'))
    this.makeClearButton(this.svg)
    this.makeDiffInactiveToggleButton(this.svg)

    const nodes = graphData.nodes.filter(d => d.type === 'node')
    this.scale = this.makeScale(nodes)

    this.xGrids = this.gridObjectsFrom(graphData.grid.x)
    this.yGrids = this.gridObjectsFrom(graphData.grid.y)
    this.makeGrids('x')
    this.makeGrids('y')

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
