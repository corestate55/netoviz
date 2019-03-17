import { zoom } from 'd3-zoom'
import { event } from 'd3-selection'
import SingleNestedGraphVisualizer from './single-visualizer'

export default class OperationalNestedGraphVisualizer extends SingleNestedGraphVisualizer {
  setOperationHandler (graphData) {
    this.svg.call(zoom()
      .scaleExtent([1 / 4, 5])
      .on('zoom', () => this.svgGrp.attr('transform', event.transform))
    )
  }
}
