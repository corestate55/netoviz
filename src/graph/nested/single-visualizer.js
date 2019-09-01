import { line as d3Line, curveLinear } from 'd3-shape'
import SingleVisualizerBase from '../common/single-visualizer-base'
import InterTpLinkCreator from './link-creator'

export default class SingleNestedVisualizer extends SingleVisualizerBase {
  constructor (width, height) {
    super()
    // canvas size
    this.width = width
    this.height = height
    // constants
    this.gridStart = -100
    this.gridEnd = 2000
    this.gridHandleRadius = 25
    this.fontSize = 15
    this.gridFontSize = 25
  }

  selectXY (xy, xValue, yValue) {
    return xy === 'x' ? xValue : yValue
  }

  makeGridHandles (xy) {
    this.svgGrp
      .selectAll(`circle.grid-${xy}-handle`)
      .data(this.selectXY(xy, this.xGrids, this.yGrids))
      .enter()
      .append('circle')
      .attr('class', `nest grid-${xy}-handle`)
      .attr('id', d => `grid-${xy}${d.index}-handle`)
      .attr('cx', d => this.selectXY(xy, d.position, this.gridStart))
      .attr('cy', d => this.selectXY(xy, this.gridStart, d.position))
      .attr('r', this.gridHandleRadius)
  }

  makeGridLines (xy) {
    this.svgGrp
      .selectAll(`line.grid-${xy}`)
      .data(this.selectXY(xy, this.xGrids, this.yGrids))
      .enter()
      .append('line')
      .attr('class', `nest grid-${xy}`)
      .attr('id', d => `grid-${xy}${d.index}`)
      .attr('x1', d => this.selectXY(xy, d.position, this.gridStart))
      .attr('y1', d => this.selectXY(xy, this.gridStart, d.position))
      .attr('x2', d => this.selectXY(xy, d.position, this.gridEnd))
      .attr('y2', d => this.selectXY(xy, this.gridEnd, d.position))
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', 5)
  }

  makeGridLabels (xy) {
    this.svgGrp
      .selectAll(`text.grid-${xy}-label`)
      .data(this.selectXY(xy, this.xGrids, this.yGrids))
      .enter()
      .append('text')
      .attr('class', `nest grid-${xy}-label`)
      .attr('id', d => `grid-${xy}${d.index}-label`)
      .attr('x', d => this.selectXY(xy, d.position, this.gridStart))
      .attr('y', d => this.selectXY(xy, this.gridStart, d.position))
      .attr('dy', this.gridFontSize / 2) // vertical center
      .attr('font-size', this.gridFontSize)
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

  colorOfNode (node) {
    return this.colorTable[this.networkPathOf(node.path)]
  }

  makeColorTable (nodes) {
    const colors = ['#e1f1e0', '#d5e5d5', '#F9FBB2', '#F8FCDA', '#e3e9c2']
    const colorTable = {}
    const layerNameList = nodes.map(node => this.networkPathOf(node.path))
    Array.from(new Set(layerNameList)) // Array.uniq
      .forEach((d, i) => {
        colorTable[d] = colors[i % colors.length]
      })
    return colorTable
  }

  makeNodes (nodes) {
    this.svgGrp
      .selectAll('rect.node')
      .data(nodes)
      .enter()
      .append('rect')
      .attr('class', d => this.objClassDef(d, 'nest node'))
      .attr('id', d => d.path)
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('width', d => d.width)
      .attr('height', d => d.height)
      .attr('rx', 5)
      .attr('ry', 5)
      .style('fill', d => this.colorOfNode(d))
  }

  makeSupportTpLines (supportTpLinks) {
    const updatedLines = this.svgGrp
      .selectAll('line.support-tp')
      .data(supportTpLinks)
    const enteredLines = updatedLines.enter().append('line')
    const targetLines = enteredLines.merge(updatedLines)
    targetLines
      .attr('class', d => this.objClassDef(d, `nest ${d.type}`))
      .attr('id', d => d.path)
      .attr('x1', d => d.x1)
      .attr('y1', d => d.y1)
      .attr('x2', d => d.x2)
      .attr('y2', d => d.y2)
      .attr('stroke-width', 4)
      .attr('stroke-dasharray', 4)
  }

  makeTpTpLines (tpTpLinks) {
    const line = d3Line()
      .x(d => d[0])
      .y(d => d[1])
      .curve(curveLinear)
    const updatedLines = this.svgGrp.selectAll('path.tp-tp').data(tpTpLinks)
    const enteredLines = updatedLines.enter().append('path')
    const targetLines = enteredLines.merge(updatedLines)
    targetLines
      .attr('class', d => this.objClassDef(d, `nest ${d.type}`))
      .attr('id', d => d.path)
      .attr('d', d => line(d.represent4Points()))
      .attr('stroke-width', 4)
  }

  makeTp (tps) {
    this.svgGrp
      .selectAll('circle.tp')
      .data(tps)
      .enter()
      .append('circle')
      .attr('class', d => this.objClassDef(d, 'nest tp'))
      .attr('id', d => d.path)
      .attr('cx', d => d.cx)
      .attr('cy', d => d.cy)
      .attr('r', d => d.r)
  }

  makeNodeLabels (nodes) {
    this.svgGrp
      .selectAll('text.node')
      .data(nodes)
      .enter()
      .append('text')
      .attr('class', d => this.objClassDef(d, 'nest node'))
      .attr('id', d => d.path)
      .attr('x', d => d.x)
      .attr('y', d => d.y + d.height)
      .attr('dy', this.fontSize)
      .attr('font-size', this.fontSize)
      .text(d => d.name)
  }

  makeTpLabels (tps) {
    this.svgGrp
      .selectAll('text.tp')
      .data(tps)
      .enter()
      .append('text')
      .attr('class', d => this.objClassDef(d, 'nest tp'))
      .attr('id', d => d.path)
      .attr('x', d => d.cx)
      .attr('y', d => d.cy + d.r)
      .attr('dy', this.fontSize)
      .attr('font-size', this.fontSize)
      .text(d => d.name)
  }

  makeGridFittingButton () {
    this.svg
      .append('text')
      .attr('id', 'grid-fitting-button')
      .attr('class', 'control-button')
      .attr('x', 6)
      .attr('y', 50)
      .text('[Grid Fitting]')
  }

  makeGraphObjects (graphData) {
    this.makeGraphSVG('nested-view', null, 'whole-nested-graph')
    this.makeGraphControlButtons()
    this.makeGridFittingButton()

    const nodes = graphData.nodes.filter(d => d.type === 'node')

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
