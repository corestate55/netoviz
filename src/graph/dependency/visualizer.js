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
    for (const layer of this.graphData) {
      const result = layer.nodes.find(d => d.name === alert.host)
      if (result) {
        this.clickEventHandler(result)
        break
      }
    }
  }
}
