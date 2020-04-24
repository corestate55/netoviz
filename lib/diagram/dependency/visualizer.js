/**
 * @file Definition of class to visualize dependency network diagram.
 */

import { json } from 'd3-fetch'
import DependencyDiagramOperator from './operator'

/**
 * Dependency network diagram visualizer.
 * @extends {DependencyDiagramOperator}
 */
class DependencyDiagramVisualizer extends DependencyDiagramOperator {
  /**
   * Draw topology json data as SVG diagram.
   * @param {string} jsonName - Name of topology file.
   * @param {AlertRow} alert - Selected alert.
   * @public
   */
  drawRfcTopologyData(jsonName, alert) {
    const params = {
      target: this.targetNameFromAlert(alert)
    }
    json(this.restURI('dependency', jsonName, params)).then(
      topologyData => {
        this.clearDiagramContainer()
        this.makeAllDiagramElements(topologyData)
        this.setAllDiagramElementsHandler()
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
    if (!alert || !this.topologyData) {
      return
    }
    // find and select (highlight) a node
    //   network(layer) order is assumed as high -> low
    //   search the node to highlight from low layer
    // use spread copy to avoid destructive reverse.
    for (const networkData of [...this.topologyData].reverse()) {
      const result = networkData.nodes.find(d => d.name === alert.host)
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

export default DependencyDiagramVisualizer
