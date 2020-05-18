/**
 * @file Definition of class to visualize distance diagram.
 */

import { line as d3line, curveCardinal } from 'd3-shape'
import MultilayerDiagramBase from '../common/multilayer-diagram-base'

/**
 * Distance diagram visualizer.
 * @extends {MultilayerDiagramBase}
 */
class DistanceDiagramBuilder extends MultilayerDiagramBase {
  /**
   * @param {string} restURIBase
   * @param {string} grpcURIBase
   * @param {number} width - Width of diagram. (SVG canvas)
   * @param {number} height - height of diagram. (SVG canvas)
   */
  constructor(restURIBase, grpcURIBase, width, height) {
    super('DISTANCE', restURIBase, grpcURIBase)

    // canvas size
    /** @type {number} */
    this.width = width
    /** @type {number} */
    this.height = height
    /** @const {number} */
    this.fontSize = 10
  }

  /**
   * Make node circles.
   * @private
   */
  _makeNodeCircles() {
    this.rootSVGGroupSelection
      .selectAll('circle.node')
      .data(this.wholeNodes)
      .enter()
      .append('circle')
      .attr('class', d => this.classStringFrom(d, 'dist node'))
      .attr('id', d => d.path)
      .attr('cx', d => d.cx)
      .attr('cy', d => d.cy)
      .attr('r', d => d.r)
  }

  /**
   * Make node labels.
   * @private
   */
  _makeNodeLabels() {
    this.rootSVGGroupSelection
      .selectAll('text.node')
      .data(this.wholeNodes)
      .enter()
      .append('text')
      .attr('class', d => this.classStringFrom(d, 'dist node'))
      .attr('id', d => `${d.path}-label`)
      .attr('x', d => d.cx)
      .attr('y', d => d.cy)
      .attr('font-size', this.fontSize)
      .text(d => d.name)
  }

  /**
   * Make distance-circles.
   * @private
   */
  _makeDistanceCircles() {
    this.rootSVGGroupSelection
      .selectAll('circle.concentric')
      .data([...this.topologyData.layouts].reverse())
      .enter()
      .append('circle')
      .attr('id', d => `dist-circle-${d.dIndex}`)
      .attr('class', d => `dist concentric bg${d.dIndex % 2}`)
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', d => d.r)
  }

  /**
   * Make link group (to insert links between distance-circle and node-circle)
   * @private
   */
  _makeLinkSVGGroup() {
    this.linkGroupSelection = this.rootSVGGroupSelection
      .append('g')
      .attr('id', 'links')
  }

  /**
   * Convert link data to link points.
   * @param {Array<DistanceNodeData>} nodes - Nodes.
   * @param {DistanceLinkData} linkData - Link data to convert.
   * @returns {Array<DistanceLinkPoints>} - Array of link points.
   * @private
   */
  _convertLinkToPoints(nodes, linkData) {
    const nodePos = path => nodes.find(d => d.path === path)
    // larger curve (mid-point randomness) proportional with link length.
    const mid = (p, dp, k) => p + dp / 2 + k * (2 * Math.random() - 1)
    const p1 = nodePos(linkData.sourceNodePath)
    const p2 = nodePos(linkData.targetNodePath)
    const dx = p2.cx - p1.cx
    const dy = p2.cy - p1.cy
    const k = Math.sqrt(dx * dx + dy * dy) * 0.15 // 15% of link length
    const pmX = mid(p1.cx, dx, k)
    const pmY = mid(p1.cy, dy, k)

    /**
     * @typedef {Object} DistanceLinkPoints
     * @prop {number} x
     * @prop {number} y
     */
    return [
      { x: p1.cx, y: p1.cy },
      { x: pmX, y: pmY },
      { x: p2.cx, y: p2.cy }
    ]
  }

  /**
   * Make link line.
   * @param {Array<DistanceNodeData>} nodes - Nodes.
   * @param {Array<DistanceLinkData>} links - Links.
   * @param {string} linkClass - Class string.
   * @param {Function} linkClassFunction - Class string generator.
   * @private
   */
  _makeLinkLine(nodes, links, linkClass, linkClassFunction) {
    const lineGenerator = d3line()
      .x(d => d.x)
      .y(d => d.y)
      .curve(curveCardinal)
    this.linkGroupSelection
      .selectAll(`path.${linkClass}`)
      .data(links)
      .enter()
      .append('path')
      .attr('id', d => d.path)
      .attr('class', d => linkClassFunction(d, `dist ${linkClass}`))
      .attr('d', d => lineGenerator(this._convertLinkToPoints(nodes, d)))
  }

  /**
   * Make tp-tp (inter-node) link line.
   * @private
   */
  _makeTpTpLinkLine() {
    this._makeLinkLine(
      this.wholeNodes,
      this.topologyData.links,
      'inter-nodes',
      (d, classStr) => this.classStringFrom(d, classStr)
    )
  }

  /**
   * Make support-node link line.
   * @private
   */
  _makeSupportNodeLinks() {
    this._makeLinkLine(
      this.wholeNodes,
      this.topologyData.supportLinks,
      'support-node',
      (_d, classStr) => classStr
    )
  }

  /**
   * Check if layout data is empty.
   * @returns {boolean} True if empty.
   * @protected
   */
  isEmptyLayout() {
    return Object.keys(this.topologyData.layouts).length < 1
  }

  /**
   * @override
   */
  makeAllDiagramElements(topologyData) {
    this.makeRootSVG('distance-view', '', 'whole-distance-graph')
    this.makeDiagramControlButtons()

    this.topologyData = /** @type {DistanceTopologyData} */ topologyData
    if (this.isEmptyLayout()) {
      return
    }

    /**
     * Alias to access all nodes.
     * @type {Array<DistanceNodeData>}
     */
    this.wholeNodes = topologyData.layouts.reduce(
      (sum, l) => sum.concat(l.nodes),
      []
    )
    this._makeDistanceCircles() // before at node (as background)
    this._makeLinkSVGGroup() // links in distance-circle and node-circle
    this._makeNodeCircles()
    this._makeNodeLabels()
    this._makeTpTpLinkLine()
    this._makeSupportNodeLinks()
  }
}

export default DistanceDiagramBuilder
