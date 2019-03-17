import { json } from 'd3-request'
import OperationalDepGraphVisualizer from './operational-visualizer'

export default class DepGraphVisualizer extends OperationalDepGraphVisualizer {
  drawJsonModel (jsonName, alert) {
    // URL draw-dep-graph/:jsonName is the API
    // that convert topology json (model/:jsonName)
    // to graph object data by json format.
    json(`draw-dep-graph/${jsonName}`, (error, graphData) => {
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
