import { json } from 'd3-request'
import OperationalNestedGraphVisualizer from './operational-visualizer'

export default class NestedGraphVisualizer extends OperationalNestedGraphVisualizer {
  drawJsonModel (jsonName, alert) {
    json(`graph/nested/${jsonName}`, (error, graphData) => {
      if (error) {
        throw error
      }
      this.clearCanvas()
      this.makeGraphObjects(graphData)
      this.setOperationHandler(graphData)
    })
  }
}
