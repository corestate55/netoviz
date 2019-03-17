import { json } from 'd3-request'
import OperationalDepGraphVisualizer from './operational-visualizer'

export default class DepGraphVisualizer extends OperationalDepGraphVisualizer {
  drawJsonModel (jsonName, alert) {
    json(`graph/dependency/${jsonName}`, (error, graphData) => {
      if (error) {
        throw error
      }
      this.clearCanvas()
      this.makeGraphObjects(graphData)
      this.setOperationHandler(graphData)
      this.highlightByAlert(alert)
    })
  }

  highlightByAlert (alert) {
    // this.graphData = json data
    // assign at this.setOperationhandler()
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
