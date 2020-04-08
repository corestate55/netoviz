/**
 * @file Definition of class to visualize distance diagram.
 */

import { json } from 'd3-fetch'
import DistanceDiagramOperator from './operator'

/**
 * Distance diagram visualizer.
 * @extends {DistanceDiagramOperator}
 */
class DistanceDiagramVisualizer extends DistanceDiagramOperator {
  /**
   * Draw topology json data as SVG diagram.
   * @param {string} jsonName - Name of topology file.
   * @param {AlertRow} alert - Selected alert.
   * @param {string} [layer] - Layer name of selected node to highlight.
   * @public
   */
  drawRfcTopologyData(jsonName, alert, layer) {
    const params = {
      target: this.targetNameFromAlert(alert),
      layer
    }
    json(this.apiURI('distance', jsonName, params)).then(
      graphData => {
        console.log('[distance] : ', graphData)
        this.clearDiagramContainer()
        this.makeAllDiagramElements(graphData)
        this.setAllDiagramElementHandler(graphData)
        this.highlightByAlert(alert)
      },
      error => {
        throw error
      }
    )
  }

  /**
   * Set callback from Frontend(UI) for node click (drill-down).
   * @param {DistanceDiagramVisualizer-uiSideNodeClickCallback} callback - Click callback.
   * @public
   */
  setUISideNodeClickHook(callback) {
    /**
     * @callback DistanceDiagramVisualizer-uiSideNodeClickCallback
     * @param {DistanceNodeData} nodeData - Clicked node data.
     */
    /**
     * @type {DistanceDiagramVisualizer-uiSideNodeClickCallback}
     */
    this.uiSideNodeClickCallback = callback
  }

  /**
   * @override
   */
  nodeClickHook(nodeData) {
    if (typeof this.uiSideNodeClickCallback === 'function') {
      // if this callback exist, redraw event will be arise from UI-side.
      this.uiSideNodeClickCallback(nodeData)
    }
  }

  /**
   * Highlight node with selected host in alert-table.
   * @param {AlertRow} alert - Selected alert.
   * @public
   */
  highlightByAlert(alert) {
    if (!alert || !this.topologyData) {
      return
    }
    if (this.isEmptyLayout()) {
      this.makeWarningMessage(`Alert: ${alert.host} is not found.`)
      return
    }

    this.clearWarningMessage()
    this.highlightNodeCircle(this.targetNodeData()) // highlight alert-host = target-node
  }
}

export default DistanceDiagramVisualizer
