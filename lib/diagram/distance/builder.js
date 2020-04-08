/**
 * @file Definition of class to visualize distance diagram.
 */

import { line as d3line, curveCardinal } from 'd3-shape'
import DiagramBase from '../common/diagram-base'

/**
 * Distance diagram visualizer.
 * @extends {DiagramBase}
 */
class DistanceDiagramBuilder extends DiagramBase {
  /**
   * @param {number} width - Width of diagram. (SVG canvas)
   * @param {number} height - height of diagram. (SVG canvas)
   */
  constructor(width, height) {
    super()
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
   * @param {Array<DistanceNodeData>} nodes - Nodes.
   * @private
   */
  _makeNodeCircles(nodes) {
    this.rootSVGGroupSelection
      .selectAll('circle.node')
      .data(nodes)
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
   * @param {Array<DistanceNodeData>} nodes - Nodes.
   * @private
   */
  _makeNodeLabels(nodes) {
    this.rootSVGGroupSelection
      .selectAll('text.node')
      .data(nodes)
      .enter()
      .append('text')
      .attr('class', d => this.classStringFrom(d, 'dist node'))
      .attr('id', d => `${d.path}-label`)
      .attr('x', d => d.cx)
      .attr('y', d => d.cy)
      .attr('font-size', this.fontSize)
      .text(d => d.path)
  }

  /**
   * Make distance-circles.
   * @param {Array<DistanceNodeLayoutData>} layouts - Layout data.
   * @private
   */
  _makeDistanceCircles(layouts) {
    this.rootSVGGroupSelection
      .selectAll('circle.concentric')
      .data(layouts.slice(1)) // head (dIndex=0) is unnecessary (r=0)
      .enter()
      .append('circle')
      .attr('id', d => `dist-circle-${d.dIndex}`)
      .attr('class', 'dist concentric')
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
      .attr('class', d => linkClassFunction(d, `dist ${linkClass}`))
      .attr('d', d => lineGenerator(this._convertLinkToPoints(nodes, d)))
  }

  /**
   * Make tp-tp (inter-node) link line.
   * @param {Array<DistanceNodeData>} nodes - Nodes.
   * @param {Array<DistanceLinkData>} links - Links.
   * @private
   */
  _makeTpTpLinkLine(nodes, links) {
    const classStringFrom = (d, classStr) => this.classStringFrom(d, classStr)
    this._makeLinkLine(nodes, links, 'inter-nodes', classStringFrom)
  }

  /**
   * Make support-node link line.
   * @param {Array<DistanceNodeData>} nodes - Nodes.
   * @param {Array<DistanceLinkData>} links - Links.
   * @private
   */
  _makeSupportNodeLinks(nodes, links) {
    const classStringFrom = (_d, classStr) => classStr
    this._makeLinkLine(nodes, links, 'support-node', classStringFrom)
  }

  /**
   * Make all svg elements of dependency network diagram.
   * @param {DistanceTopologyData} topologyData - Topology data.
   * @public
   */
  makeAllDiagramElements(topologyData) {
    this.makeRootSVG('distance-view', '', 'whole-distance-graph')
    this.makeDiagramControlButtons()

    this._makeDistanceCircles(topologyData.layouts) // before at node (as background)
    this._makeLinkSVGGroup() // links in distance-circle and node-circle
    const nodes = topologyData.layouts.reduce(
      (sum, ld) => sum.concat(ld.nodes),
      []
    )
    this._makeNodeCircles(nodes)
    this._makeNodeLabels(nodes)
    this._makeTpTpLinkLine(nodes, topologyData.links)
    this._makeSupportNodeLinks(nodes, topologyData.supportLinks)
  }
}

export default DistanceDiagramBuilder
