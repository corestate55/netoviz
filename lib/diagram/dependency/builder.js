/**
 * @file Definition of class to visualize dependency network diagram.
 */

import MultilayerDiagramBase from '../common/multilayer-diagram-base'

/**
 * Dependency network diagram visualizer.
 * @extends {MultilayerDiagramBase}
 */
class DependencyDiagramBuilder extends MultilayerDiagramBase {
  /**
   * @param {VisualizerAPIParam} apiParam
   * @param {number} width - Width of diagram. (SVG canvas)
   * @param {number} height - height of diagram. (SVG canvas)
   */
  constructor(apiParam, width, height) {
    super('DEPENDENCY', apiParam)

    // canvas size
    /** @type {number} */
    this.width = width
    /** @type {number} */
    this.height = height

    // constants
    /** @const {number} */
    this.fontSize = 20
  }

  /**
   * Make svg-group for network-labels.
   * @returns {Selection} SVG-group for network-labels.
   * @private
   */
  _makeNetworkLabelsGroup() {
    return this.rootSVGGroupSelection.append('g').attr('class', 'layer-labels')
  }

  /**
   * Make network-labels.
   * @param {Selection} origin - SVG element to append network labels.
   * @returns {Selection} Network labels.
   * @private
   */
  _makeNetworkLabels(origin) {
    return origin
      .selectAll('text')
      .data(this.topologyData)
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
  _makeNetworkElementsGroup() {
    return this.rootSVGGroupSelection.append('g').attr('class', 'layer-objects')
  }

  /**
   * Make node rectangles in a network.
   * @param {DependencyNetworkData} networkData - Network data.
   * @param {Selection} origin - SVG element to append rectangles.
   * @returns {Selection} Node rectangles.
   * @private
   */
  _makeNodeRectsInNetwork(networkData, origin) {
    return origin
      .selectAll('rect')
      .data(networkData.nodes)
      .enter()
      .append('rect')
      .attr('class', d => this.classStringFrom(d, 'dep'))
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
   * @param {DependencyNetworkData} networkData - Network data.
   * @param {Selection} origin - SVG element to append circles.
   * @returns {Selection} Term-point circles.
   * @private
   */
  _makeTermPointCirclesInNetwork(networkData, origin) {
    return origin
      .selectAll('circle')
      .data(networkData.tps)
      .enter()
      .append('circle')
      .attr('class', d => this.classStringFrom(d, 'dep'))
      .attr('id', d => d.path)
      .attr('cx', d => d.cx)
      .attr('cy', d => d.cy)
      .attr('r', d => d.r)
    // .append('title')
    // .text(d => d.path)
  }

  /**
   * Make node labels in network.
   * @param {DependencyNetworkData} networkData - Network data.
   * @param {Selection} origin - SVG element to append labels.
   * @returns {Selection} Node labels.
   * @private
   */
  _makeNodeLabelsInNetwork(networkData, origin) {
    return origin
      .selectAll('text.node')
      .data(networkData.nodes)
      .enter()
      .append('text')
      .attr('class', d => this.classStringFrom(d, 'dep node'))
      .attr('id', d => `${d.path}-ndlb`)
      .attr('x', d => d.x)
      .attr('y', d => d.y + d.height)
      .attr('dy', this.fontSize)
      .attr('font-size', this.fontSize)
      .text(d => d.name)
  }

  /**
   * Make term-point labels in network.
   * @param {DependencyNetworkData} networkData - Network data.
   * @param {Selection} origin - SVG element to append labels.
   * @returns {Selection} Term-point labels.
   * @private
   */
  _makeTermPointLabelsInNetwork(networkData, origin) {
    return origin
      .selectAll('text.tp')
      .data(networkData.tps)
      .enter()
      .append('text')
      .attr('class', d => this.classStringFrom(d, 'dep tp'))
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
  _makeDependencyLinesGroup() {
    return this.rootSVGGroupSelection.append('g').attr('class', 'dep-lines')
  }

  /**
   * @override
   */
  makeAllDiagramElements(topologyData) {
    this.makeRootSVG('dependency-view', '', 'whole-dep-graph')
    this.makeDiagramControlButtons()

    /** @type {DependencyTopologyData} */
    this.topologyData = topologyData

    // for each network
    const networkLabelsGroupSelection = this._makeNetworkLabelsGroup()
    this._makeNetworkLabels(networkLabelsGroupSelection)

    // for each node/tp
    for (const networkData of this.topologyData) {
      const networkElementsGroupSelection = this._makeNetworkElementsGroup()
      this._makeNodeRectsInNetwork(networkData, networkElementsGroupSelection)
      this._makeTermPointCirclesInNetwork(
        networkData,
        networkElementsGroupSelection
      )
      this._makeNodeLabelsInNetwork(networkData, networkElementsGroupSelection)
      this._makeTermPointLabelsInNetwork(
        networkData,
        networkElementsGroupSelection
      )
    }
    /**
     * SVG-group of dependency line.
     * (NOTICE order/overlay: lines at upper of other svg-elements.)
     * @type {Selection}
     */
    this.dependencyLinesGroupSelection = this._makeDependencyLinesGroup()
  }
}

export default DependencyDiagramBuilder
