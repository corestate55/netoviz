/**
 * @file Definition of class to visualize dependency network diagram.
 */

import { json } from 'd3-fetch'
import OperationalDepGraphVisualizer from './operational-visualizer'

/**
 * Dependency network diagram visualizer.
 * @extends {OperationalDepGraphVisualizer}
 */
class DepGraphVisualizer extends OperationalDepGraphVisualizer {
  /**
   * Draw topology json data as SVG diagram.
   * @param {string} jsonName - Name of topology file.
   * @param {AlertRow} alert - Selected alert.
   * @public
   */
  drawJsonModel(jsonName, alert) {
    const params = {
      target: this.targetNameFromAlert(alert)
    }
    json(this.apiURI('dependency', jsonName, params)).then(
      graphData => {
        this.clearCanvas()
        this.makeGraphObjects(graphData)
        this.setOperationHandler(graphData)
        this.highlightByAlert(alert)
      },
      error => {
        throw error
      }
    )
  }

  /**
   * Highlight node with selected host in alert-table.
   * @param {AlertRow} alert - Selected alert.
   * @public
   */
  highlightByAlert(alert) {
    // this.graphData = json data
    // assign at this.setOperationHandler()
    if (!alert || !this.graphData) {
      return
    }
    // console.log('graphData: ', this.graphData)
    // find and select (highlight) a node
    //   layer(graph) order is assumed as high -> low
    //   search the node to highlight from low layer
    for (const layer of this.graphData.reverse()) {
      const result = layer.nodes.find(d => d.name === alert.host)
      if (result) {
        this.clearWarningMessage()
        this.clickHandler(result)
        break
      } else {
        const message = `Alerted host: [${alert.host}] is not found.`
        this.clearAllHighlight()
        this.makeWarningMessage(message)
      }
    }
  }
}

export default DepGraphVisualizer
