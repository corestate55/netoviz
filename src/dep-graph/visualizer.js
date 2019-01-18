import { json } from 'd3-request'
import { OperationalDepGraphVisualizer } from './operational-visualizer'

export class DepGraphVisualizer extends OperationalDepGraphVisualizer {
  constructor () {
    super()
  }

  drawJsonModel (jsonName) {
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
    })
  }
}
