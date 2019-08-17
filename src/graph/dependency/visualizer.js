import { json } from 'd3-fetch'
import OperationalDepGraphVisualizer from './operational-visualizer'

export default class DepGraphVisualizer extends OperationalDepGraphVisualizer {
  drawJsonModel (jsonName, alert) {
    json(`graph/dependency/${jsonName}`).then((graphData) => {
      this.clearCanvas()
      this.makeGraphObjects(graphData)
      this.setOperationHandler(graphData)
      this.highlightByAlert(alert)
    }, (error) => {
      throw error
    })
  }

  highlightByAlert (alert) {
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
        this.clickEventHandler(result)
        break
      } else {
        const message = `Alerted host: [${alert.host}] is not found.`
        this.makeWarningMessage(message)
      }
    }
  }
}
