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
   * @public
   */
  drawRfcTopologyData(jsonName, alert) {
    // TODO: layer param?
    const params = {
      target: this.targetNameFromAlert(alert)
    }
    json(this.apiURI('distance', jsonName, params)).then(
      graphData => {
        console.log(graphData) // debug
        this.clearDiagramContainer()
        this.makeAllDiagramElements(graphData)
        this.setAllDiagramElementHandler(graphData)
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
    // if (!alert || !this.topologyData) {
    //   return
    // }
    // TODO: TBA
  }
}

export default DistanceDiagramVisualizer
