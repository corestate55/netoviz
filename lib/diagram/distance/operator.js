/**
 * @file Definition of class to visualize distance diagram.
 */

import { event } from 'd3-selection'
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
    this.zoom = zoom().on('zoom', () =>
      this.rootSVGGroupSelection.attr('transform', event.transform)
    )
    this.rootSVGSelection.call(this.zoom)
    this._setInitialZoom()
  }

  /**
   * Get target node data;
   * @returns {DistanceNodeData} Target node data.
   * @public
   */
  targetNodeData() {
    return this.topologyData.layouts[0].nodes[0]
  }

  /**
   * Select node circle by path.
   * @param {string} path - Path.
   * @returns {Selection} Selected node.
   * @private
   */
  _selectNodeCircleByPath(path) {
    return this.rootSVGGroupSelection.select(`[id='${path}']`)
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
   * Set selected to node circle.
   * @param {DistanceNodeData} elementData - Node data.
   * @private
   */
  _highlightNodeCircle(elementData) {
    this._selectNodeCircleByPath(elementData.path).classed('selected', true)
  }

  /**
   * Clear highlight.
   * @public
   */
  clearHighlight() {
    if (!this.rootSVGGroupSelection) {
      return // return if not ready svg (initial)
    }
    this.rootSVGGroupSelection.selectAll('.selected').classed('selected', false)
  }

  _clearSelectReady() {
    if (!this.rootSVGGroupSelection) {
      return // return if not ready svg (initial)
    }
    this.rootSVGGroupSelection
      .selectAll('.select-ready')
      .classed('select-ready', false)
  }

  /**
   * Event handler for nodes/term-points click.
   * @param {DistanceNodeData} elementData - Node data.
   * @protected
   */
  clickHandler(elementData) {
    this.clearHighlight()
    this._highlightNodeCircle(elementData)
  }

  /**
   * Event handler for nodes/term-points mouse-over.
   * @param {DistanceNodeData} elementData - Node data.
   * @private
   */
  _mouseOverHandler(elementData) {
    this._selectReadyNodeCircle(elementData)
    this.tooltip.enableTooltip(elementData)
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
   * Check if layout data is empty.
   * @returns {boolean} True if empty.
   * @public
   */
  isEmptyLayout() {
    return Object.keys(this.topologyData.layouts).length < 1
  }

  /**
   * Set event handlers to Node rectangles/labels.
   * @private
   */
  _setNodeMouseHandler() {
    this.rootSVGGroupSelection
      .selectAll('.dist.node')
      .on('click', d => this.clickHandler(d))
      .on('mouseover', d => this._mouseOverHandler(d))
      .on('mouseout', d => this._mouseOutHandler(d))
  }

  /**
   * Set operation handlers to SVG elements.
   * @param {DistanceTopologyData} topologyData - Topology data.
   * @public
   */
  setAllDiagramElementHandler(topologyData) {
    /** @type {DistanceTopologyData} */
    this.topologyData = topologyData
    if (this.isEmptyLayout()) {
      return
    }

    this._setSVGZoom()
    this._setNodeMouseHandler()
    this.setDiagramControlButtonsHandler(() => {
      this.clearHighlight()
    })
  }
}

export default DistanceDiagramOperator
