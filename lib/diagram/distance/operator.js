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
    const maxDiR = layouts[layouts.length - 1].r + layouts[0].nodes[0].r
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
   * Set operation handlers to SVG elements.
   * @param {DistanceTopologyData} topologyData - Topology data.
   * @public
   */
  setAllDiagramElementHandler(topologyData) {
    if (Object.keys(topologyData.layouts).length < 1) {
      return
    }
    /** @type {DistanceTopologyData} */
    this.topologyData = topologyData
    this._setSVGZoom()
  }
}

export default DistanceDiagramOperator
