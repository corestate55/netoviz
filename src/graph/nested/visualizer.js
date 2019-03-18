import { json } from 'd3-request'
import OperationalNestedGraphVisualizer from './operational-visualizer'

export default class NestedGraphVisualizer extends OperationalNestedGraphVisualizer {
  drawJsonModel (jsonName, alert, reverse) {
    const url = `graph/nested/${jsonName}?reverse=${reverse}`
    console.log(`[nested] query ${url}`)
    json(url, (error, graphData) => {
      if (error) {
        throw error
      }
      this.clearCanvas()
      this.makeGraphObjects(graphData)
      this.setOperationHandler(graphData)
    })
  }
}
