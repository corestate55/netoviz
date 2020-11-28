/**
 * @file Definition of class to visualize distance diagram.
 */

import { zoom } from 'd3-zoom'
import DistanceDiagramBuilder from './builder'

/**
 * Distance diagram visualizer with interactive operation.
 * @extends {DistanceDiagramBuilder}
 */
class DistanceDiagramOperator extends DistanceDiagramBuilder {
  /**
   * Set initial zoom.
   * @private
   */
  _setInitialZoom() {
    const layouts = this.topologyData.layouts
    // radius of outer distance-circle + node-radius (target-node)
    const maxDiR = layouts[layouts.length - 1].r + this.targetNodeData().r
    const zoomRatio = Math.min(this.width, this.height) / (2 * maxDiR)
    this.zoom.scaleTo(this.rootSVGSelection, zoomRatio)
    this.zoom.translateTo(this.rootSVGSelection, 0, 0, [
      this.width / 2,
      this.height / 2
    ])
  }

  /**
   * Set event handler of zooming to SVG.
   * @private
   */
  _setSVGZoom() {
    this.zoom = zoom().on('zoom', event =>
      this.rootSVGGroupSelection.attr('transform', event.transform)
    )
    this.rootSVGSelection.call(this.zoom)
    this._setInitialZoom()
  }

  /**
   * Get target node data;
   * @returns {DistanceNodeData} Target node data.
   * @protected
   */
  targetNodeData() {
    return this.topologyData.layouts[0].nodes[0]
  }

  /**
   * Select node circle by node-path.
   * @param {string} path - Path.
   * @returns {Selection} Selected node.
   * @private
   */
  _selectNodeCircleByPath(path) {
    return this.rootSVGGroupSelection.select(`[id='${path}']`)
  }

  /**
   * Select link line by link-path
   * @param {string} path - Path.
   * @returns {Selection} Selected link.
   * @private
   */
  _selectLinkByPath(path) {
    return this.linkGroupSelection.select(`[id='${path}'`)
  }

  /**
   * Select node label by node-path
   * @param {string} path - Path.
   * @returns {Selection} Selected label.
   * @private
   */
  _selectNodeLabelByPath(path) {
    return this.rootSVGGroupSelection.select(`[id='${path}-label'`)
  }

  /**
   * Set select-ready to node circle.
   * @param {DistanceNodeData} elementData - Node data.
   * @private
   */
  _selectReadyNodeCircle(elementData) {
    this._selectNodeCircleByPath(elementData.path).classed('select-ready', true)
  }

  /**
   * Set select-ready to link line.
   * @param {DistanceLinkData} elementData - Link data.
   * @private
   */
  _selectReadyLink(elementData) {
    this._selectLinkByPath(elementData.path).classed('select-ready', true)
  }

  /**
   * Set select-ready to node label.
   * @param {DistanceNodeData} elementData - Node data.
   * @private
   */
  _selectReadyNodeLabel(elementData) {
    this._selectNodeLabelByPath(elementData.path).classed('select-ready', true)
  }

  /**
   * Set selected to node circle.
   * @param {DistanceNodeData} elementData - Node data.
   * @protected
   */
  highlightNodeCircle(elementData) {
    this._selectNodeCircleByPath(elementData.path).classed('selected', true)
  }

  /**
   * Clear highlight (selected).
   * @public
   */
  clearHighlight() {
    if (!this.rootSVGGroupSelection) {
      return // return if not ready svg (initial)
    }
    this.rootSVGGroupSelection.selectAll('.selected').classed('selected', false)
  }

  /**
   * Clear select-ready.
   * @private
   */
  _clearSelectReady() {
    if (!this.rootSVGGroupSelection) {
      return // return if not ready svg (initial)
    }
    this.rootSVGGroupSelection
      .selectAll('.select-ready')
      .classed('select-ready', false)
  }

  /**
   * Hook of node-click event.
   * @param {DistanceNodeData} nodeData - Clicked Node.
   * @abstract
   * @protected
   */
  nodeClickHook(nodeData) {
    // to be overridden
  }

  /**
   * Event handler for nodes/term-points click.
   * @param {DistanceNodeData} elementData - Node data.
   * @protected
   */
  clickHandler(elementData) {
    this.clearHighlight()
    this.highlightNodeCircle(elementData)
    this.nodeClickHook(elementData)
  }

  /**
   * Event handler for nodes/term-points mouse-over.
   * @param {Event} event - Event info.
   * @param {DistanceNodeData} elementData - Node data.
   * @private
   */
  _mouseOverHandler(event, elementData) {
    this._selectReadyNodeCircle(elementData)
    this._selectReadyNodeLabel(elementData)
    this._selectReadyLinkByNode(elementData)
    this.tooltip.enableTooltip(event, elementData)
  }

  /**
   * Event handler for nodes/term-points mouse-out.
   * @param {DistanceNodeData} _elementData - Node data.
   * @private
   */
  _mouseOutHandler(_elementData) {
    this._clearSelectReady()
    this.tooltip.disableTooltip()
  }

  /**
   * Set event handlers to node rectangles/labels.
   * @private
   */
  _setNodeMouseHandler() {
    this.rootSVGGroupSelection
      .selectAll('.dist.node')
      .on('click', (event, d) => this.clickHandler(d))
      .on('mouseover', (event, d) => this._mouseOverHandler(event, d))
      .on('mouseout', (event, d) => this._mouseOutHandler(d))
  }

  /**
   * Find all links from node.
   * @param {string} path - Node path.
   * @returns {Array<DistanceLinkData>} - Links
   * @private
   */
  _findLinksConnectedWithNode(path) {
    const hasEndNodeByPath = l =>
      l.sourceNodePath === path || l.targetNodePath === path
    const links = this.topologyData.links.filter(hasEndNodeByPath)
    const supportLinks = this.topologyData.supportLinks.filter(hasEndNodeByPath)
    return links.concat(supportLinks)
  }

  /**
   * Set select-ready to link which connected to the node.
   * @param {DistanceNodeData} nodeData - Node.
   * @private
   */
  _selectReadyLinkByNode(nodeData) {
    this._findLinksConnectedWithNode(nodeData.path).forEach(l => {
      this._selectReadyLink(l)
    })
  }

  /**
   * Find two nodes at the link end.
   * @param {DistanceLinkData} linkData - Link.
   * @returns {Array<DistanceNode>} - Nodes.
   * @private
   */
  _findNodesAtLinkEnd(linkData) {
    const matchNodePath = (d, path) => d.path === path
    return [
      this.wholeNodes.find(d => matchNodePath(d, linkData.sourceNodePath)),
      this.wholeNodes.find(d => matchNodePath(d, linkData.targetNodePath))
    ]
  }

  /**
   * Event handler for link mouse-over.
   * @param linkData
   * @private
   */
  _linkMouseOverHandler(linkData) {
    this._selectReadyLink(linkData)
    this._findNodesAtLinkEnd(linkData).forEach(n =>
      this._selectReadyNodeCircle(n)
    )
  }

  /**
   * Set event handlers to links.
   * @private
   */
  _setLinkMouseHandler() {
    this.linkGroupSelection
      .selectAll('path')
      .on('mouseover', (event, d) => this._linkMouseOverHandler(d))
      .on('mouseout', () => this._clearSelectReady())
  }

  /**
   * @override
   */
  setAllDiagramElementsHandler() {
    if (this.isEmptyLayout()) {
      return
    }

    this._setSVGZoom()
    this._setNodeMouseHandler()
    this._setLinkMouseHandler()
    this.setDiagramControlButtonsHandler(() => {
      this.clearHighlight()
    })
  }
}

export default DistanceDiagramOperator
