import { json } from 'd3-fetch'
import OperationalNestedGraphVisualizer from './operational-visualizer'

export default class NestedGraphVisualizer extends OperationalNestedGraphVisualizer {
  drawJsonModel (jsonName, alert, reverse) {
    const url = `graph/nested/${jsonName}?reverse=${reverse}`
    console.log(`[nested] query ${url}`)
    json(url).then((graphData) => {
      this.clearCanvas()
      this.makeGraphObjects(graphData)
      this.setOperationHandler(graphData)
    }, (error) => {
      throw error
    })
  }
}
