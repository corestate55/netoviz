/**
 * @file Definition of class to visualize distance diagram.
 */

import DistanceDiagramOperator from './operator'

/**
 * Distance diagram visualizer.
 * @extends {DistanceDiagramOperator}
 */
class DistanceDiagramVisualizer extends DistanceDiagramOperator {
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
   * @override
   */
  highlightByAlert(alertHost) {
    if (!alertHost || !this.topologyData) {
      return
    }
    const alert = this.splitAlertHost(alertHost)

    if (this.isEmptyLayout()) {
      this.makeWarningMessage(`Alert: ${alert.host} is not found.`)
      return
    }
    this.clearWarningMessage()
    this.highlightNodeCircle(this.targetNodeData()) // highlight alert-host = target-node
  }
}

export default DistanceDiagramVisualizer
