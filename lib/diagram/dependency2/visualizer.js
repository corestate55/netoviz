/**
 * @file Definition of class to visualize dependency-2 network diagram.
 */

import { json } from 'd3-fetch'
import Dependency2DiagramOperator from './operator'

/**
 * Dependency-2 network diagram visualizer.
 * @extends {Dependency2DiagramOperator}
 */
class Dependency2DiagramVisualizer extends Dependency2DiagramOperator {
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
    json(this.apiURI('dependency', jsonName, params)).then(
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
   * Find diagram-element by node.
   * @param {string} name - Name of element.
   * @returns {Dependency2NodeData} Found element.
   * @private
   */
  _findNodeObjByName(name) {
    return this.allNodeDataList()
      .reverse() // find low layer at first
      .find(d => d.type === 'node' && d.name === name)
  }

  /**
   * Highlight node with selected host in alert-table.
   * @param {AlertRow} alert - Selected alert.
   * @public
   */
  highlightByAlert(alert) {
    if (!alert || !this.rootSVGSelection) {
      return
    }
    const result = this._findNodeObjByName(alert.host)
    if (result) {
      this.clearWarningMessage()
      this.clickHandler(result)
    } else {
      const message = `Alerted host: [${alert.host}] is not found.`
      this.clearAllHighlight()
      this.makeWarningMessage(message)
    }
  }
}

export default Dependency2DiagramVisualizer
