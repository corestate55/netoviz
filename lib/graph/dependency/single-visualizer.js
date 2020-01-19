/**
 * @file Definition of class to visualize dependency network diagram.
 */

import SingleVisualizerBase from '../common/single-visualizer-base'

/**
 * Dependency network diagram visualizer.
 * @extends {SingleVisualizerBase}
 */
class SingleDepGraphVisualizer extends SingleVisualizerBase {
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
    /**
     * @const
     * @type {number}
     */
    this.fontSize = 20
  }

  /**
   * Make svg-group for network-labels.
   * @returns {Selection} SVG-group for network-labels.
   * @private
   */
  _makeLayerGroup() {
    return this.svgGrp.append('g').attr('class', 'layer-labels')
  }

  /**
   * Make network-labels.
   * @param {DependencyTopologyData} graphData - Topology data.
   * @param {Selection} origin - SVG element to append network labels.
   * @returns {Selection} Network labels.
   * @private
   */
  _makeLayerLabel(graphData, origin) {
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

  /**
   * Make svg-group for network-rectangles/circles.
   * @returns {Selection} SVG elements.
   * @private
   */
  _makeLayerObjGroup() {
    return this.svgGrp.append('g').attr('class', 'layer-objects')
  }

  /**
   * Make node rectangles in a network.
   * @param {DependencyNetworkData} layer - Network data.
   * @param {Selection} origin - SVG element to append rectangles.
   * @returns {Selection} Node rectangles.
   * @private
   */
  _makeLayerNode(layer, origin) {
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

  /**
   * Make term-point circles in network.
   * @param {DependencyNetworkData} layer - Network data.
   * @param {Selection} origin - SVG element to append circles.
   * @returns {Selection} Term-point circles.
   * @private
   */
  _makeLayerNodeTp(layer, origin) {
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

  /**
   * Make node labels in network.
   * @param {DependencyNetworkData} layer - Network data.
   * @param {Selection} origin - SVG element to append labels.
   * @returns {Selection} Node labels.
   * @private
   */
  _makeLayerNodeLabel(layer, origin) {
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

  /**
   * Make term-point labels in network.
   * @param {DependencyNetworkData} layer - Network data.
   * @param {Selection} origin - SVG element to append labels.
   * @returns {Selection} Term-point labels.
   * @private
   */
  _makeLayerNodeTpLabel(layer, origin) {
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

  /**
   * Make svg-group for dependency lines.
   * @returns {Selection} SVG-group for dependency lines.
   * @private
   */
  _makeDepLineGroup() {
    return this.svgGrp.append('g').attr('class', 'dep-lines')
  }

  /**
   * Make all svg elements of dependency network diagram.
   * @param {DependencyTopologyData} graphData
   * @public
   */
  makeGraphObjects(graphData) {
    this.makeGraphSVG('dependency-view', '', 'whole-dep-graph')
    this.makeGraphControlButtons()

    // for each layer
    const layerLabelGroup = this._makeLayerGroup()
    this._makeLayerLabel(graphData, layerLabelGroup)

    // for each node/tp
    for (const layer of graphData) {
      const layerObjGroup = this._makeLayerObjGroup()
      this._makeLayerNode(layer, layerObjGroup)
      this._makeLayerNodeTp(layer, layerObjGroup)
      this._makeLayerNodeLabel(layer, layerObjGroup)
      this._makeLayerNodeTpLabel(layer, layerObjGroup)
    }
    /**
     * SVG-group of dependency line.
     * (NOTICE order/overlay: lines at upper of other svg-elements.)
     * @type {Selection}
     */
    this.depLineGrp = this._makeDepLineGroup()
  }
}

export default SingleDepGraphVisualizer
