/**
 * @file Definition of class to visualize nested network diagram.
 */

import DiagramBase from '../common/diagram-base'
import InterTpLinkCreator from './link-creator'

/**
 * Nested network diagram visualizer.
 * @extends {DiagramBase}
 */
class NestedDiagramBuilder extends DiagramBase {
  /**
   * @param {number} width - Width of SVG.
   * @param {number} height - Height of SVG.
   */
  constructor(width, height) {
    super()
    // canvas size
    /** @type {number} */
    this.width = width
    /** @type {number} */
    this.height = height

    // constants
    /** @const {number} */
    this.gridStart = -100
    /** @const {number} */
    this.gridEnd = 2000
    /** @const {number} */
    this.gridHandleRadius = 25
    /** @const {number} */
    this.fontSize = 15
    /** @const {number} */
    this.gridFontSize = 25
  }

  /**
   * Select value with target axis x/y.
   * @param {string} xy - Axis {'x' or 'y'}
   * @param {Object} xValue - Value for x.
   * @param {Object} yValue - Value for y.
   * @returns {Object} xValue or yValue.
   * @protected
   */
  selectXY(xy, xValue, yValue) {
    return xy === 'x' ? xValue : yValue
  }

  /**
   * Make grid handle circles.
   * @param {string} xy - Axis. (x/y)
   * @private
   */
  _makeGridHandles(xy) {
    this.rootSVGGroupSelection
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

  /**
   * Make grid lines.
   * @param {string} xy - Axis. (x/y)
   * @private
   */
  _makeGridLines(xy) {
    this.rootSVGGroupSelection
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

  /**
   * Make grid labels.
   * @param {string} xy - Axis. (x/y)
   * @private
   */
  _makeGridLabels(xy) {
    this.rootSVGGroupSelection
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

  /**
   * Make grid data.
   * @param {Array<number>} gridData - Grid positions. (x or y of NestedGridData).
   * @returns {Array<GridData>} Grid data.
   * @private
   */
  _gridObjectsFrom(gridData) {
    /**
     * @typedef {Object} GridData
     * @prop {number} position
     * @prop {number} index
     */
    return gridData.map((d, i) => ({ position: d, index: i }))
  }

  /**
   * Make grid. (line/handle/label of grid)
   * @param {string} xy - Axis. (x/y)
   * @private
   */
  _makeGrids(xy) {
    this._makeGridLines(xy)
    this._makeGridHandles(xy)
    this._makeGridLabels(xy)
  }

  /**
   * Get HTML color code for node.
   * @param {NestedNodeData} node - Target node.
   * @returns {string|null} Color code string.
   * @protected
   */
  colorOfNode(node) {
    return this.isFamilyAggregated(node)
      ? null
      : this.colorTable[this.networkPathOf(node.path)]
  }

  /**
   * Make color table. (layer name - color code dictionary)
   * @param {Array<NestedNodeData>} nodes - Nodes.
   * @returns {Object} Color table.
   * @private
   */
  _makeColorTable(nodes) {
    const colors = ['#e1f1e0', '#d5e5d5', '#F9FBB2', '#F8FCDA', '#e3e9c2']
    const colorTable = {}
    const layerNameList = nodes.map(node => this.networkPathOf(node.path))
    Array.from(new Set(layerNameList)) // Array.uniq
      .forEach((d, i) => {
        colorTable[d] = colors[i % colors.length]
      })
    return colorTable
  }

  /**
   * Make node (node-type node) rectangles.
   * @param {Array<NestedNodeData>} nodes - Nodes. (node-type nodes)
   * @private
   */
  _makeNodes(nodes) {
    this.rootSVGGroupSelection
      .selectAll('rect.node')
      .data(nodes)
      .enter()
      .append('rect')
      .attr('class', d => this.classStringFrom(d, 'nest node'))
      .attr('id', d => d.path)
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('width', d => d.width)
      .attr('height', d => d.height)
      .attr('rx', 5)
      .attr('ry', 5)
      .style('fill', d => this.colorOfNode(d))
  }

  /**
   * Make support-tp lines. (able to redraw)
   * @param {Object} supportTpLinks - Links. (support-tp type links)
   * @private
   */
  _makeSupportTpLines(supportTpLinks) {
    const updatedLines = this.rootSVGGroupSelection
      .selectAll('line.support-tp')
      .data(supportTpLinks)
    const enteredLines = updatedLines.enter().append('line')
    const targetLines = enteredLines.merge(updatedLines)
    targetLines
      .attr('class', d => this.classStringFrom(d, `nest ${d.type}`))
      .attr('id', d => d.path)
      .attr('x1', d => d.x1)
      .attr('y1', d => d.y1)
      .attr('x2', d => d.x2)
      .attr('y2', d => d.y2)
  }

  /**
   * Make tp-tp type link paths. (able to redraw)
   * @param {Array<InterTpLink>} tpTpLinks - Links. (tp-tp type links)
   * @private
   */
  _makeTpTpLines(tpTpLinks) {
    const updatedLines = this.rootSVGGroupSelection
      .selectAll('path.tp-tp')
      .data(tpTpLinks)
    const enteredLines = updatedLines.enter().append('path')
    const targetLines = enteredLines.merge(updatedLines)
    targetLines
      .attr('class', d => this.classStringFrom(d, `nest ${d.type}`))
      .attr('id', d => d.path)
      // .attr('d', d => d.singleLine()) // for debugging
      // .attr('d', d => d.polyline())
      .attr('d', d => d.circledCornerPolyline())
  }

  /**
   * (Re)Make all types of link lines/paths.
   * @param {NestedTopologyData} graphData - Graph data of nested graph.
   */
  remakeLinkLines(graphData) {
    const linkCreator = new InterTpLinkCreator(graphData)
    this._makeSupportTpLines(linkCreator.supportTpLinks())
    this._makeTpTpLines(linkCreator.tpTpLinks())
  }

  /**
   * Make term-point circle.
   * @param {Array<NestedNodeData>} tps - Term-points. (tp-type node)
   * @private
   */
  _makeTps(tps) {
    this.rootSVGGroupSelection
      .selectAll('circle.tp')
      .data(tps)
      .enter()
      .append('circle')
      .attr('class', d => this.classStringFrom(d, 'nest tp'))
      .attr('id', d => d.path)
      .attr('cx', d => d.cx)
      .attr('cy', d => d.cy)
      .attr('r', d => d.r)
  }

  /**
   * Make label text for node-type node.
   * @param {Array<NestedNodeData>} nodes - Nodes. (node-type nodes)
   * @private
   */
  _makeNodeLabels(nodes) {
    this.rootSVGGroupSelection
      .selectAll('text.node')
      .data(nodes)
      .enter()
      .append('text')
      .attr('class', d => this.classStringFrom(d, 'nest node'))
      .attr('id', d => d.path)
      .attr('x', d => d.x)
      .attr('y', d => d.y + d.height)
      .attr('dy', this.fontSize)
      .attr('font-size', this.fontSize)
      .text(d => d.name)
  }

  /**
   * Make label text for tp-type node.
   * @param {Array<NestedNodeData>} tps - Term-points. (tp-type nodes)
   * @private
   */
  _makeTpLabels(tps) {
    this.rootSVGGroupSelection
      .selectAll('text.tp')
      .data(tps)
      .enter()
      .append('text')
      .attr('class', d => this.classStringFrom(d, 'nest tp'))
      .attr('id', d => d.path)
      .attr('x', d => d.cx)
      .attr('y', d => d.cy + d.r)
      .attr('dy', this.fontSize)
      .attr('font-size', this.fontSize)
      .text(d => d.name)
  }

  /**
   * Make "Grid fitting" text (button) in SVG.
   * @private
   */
  _makeGridFittingButton() {
    this.rootSVGSelection
      .append('text')
      .attr('id', 'grid-fitting-button')
      .attr('class', 'control-button')
      .attr('x', 6)
      .attr('y', 50)
      .text('[Grid Fitting]')
  }

  /**
   * @override
   */
  makeDiagramControlButtons() {
    super.makeDiagramControlButtons()
    this._makeGridFittingButton()
  }

  /**
   * Make all nested graph (diagram) SVG elements.
   * @param {NestedTopologyData} graphData - Graph data of nested graph.
   * @protected
   */
  makeGraphObjects(graphData) {
    this.makeRootSVG('nested-view', '', 'whole-nested-graph')
    this.makeDiagramControlButtons()

    const nodes = graphData.nodes.filter(d => d.type === 'node')

    /** @type {Array<GridData>} */
    this.xGrids = this._gridObjectsFrom(graphData.grid.x)
    /** @type {Array<GridData>} */
    this.yGrids = this._gridObjectsFrom(graphData.grid.y)
    this._makeGrids('x')
    this._makeGrids('y')

    /** @type {Object} */
    this.colorTable = this._makeColorTable(nodes)
    this._makeNodes(nodes)

    this.remakeLinkLines(graphData)

    const termPoints = graphData.nodes.filter(d => d.type === 'tp')
    this._makeTps(termPoints)

    this._makeNodeLabels(nodes)
    this._makeTpLabels(termPoints)
  }
}

export default NestedDiagramBuilder
