/**
 * @file Definition of class to visualize dependency network diagram.
 */

import DependencyDiagramOperator from './operator'

/**
 * Dependency network diagram visualizer.
 * @extends {DependencyDiagramOperator}
 */
class DependencyDiagramVisualizer extends DependencyDiagramOperator {
  /**
   * @override
   */
  highlightByAlert(alertHost) {
    if (!alertHost || !this.topologyData) {
      return
    }
    const alert = this.splitAlertHost(alertHost)

    // find and select (highlight) a node
    //   network(layer) order is assumed as high -> low
    //   search the node to highlight from low layer
    // use spread copy to avoid destructive reverse.
    for (const networkData of [...this.topologyData].reverse()) {
      const result = networkData.nodes.find((d) => d.name === alert.host)
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
