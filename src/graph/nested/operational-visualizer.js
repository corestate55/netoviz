import { event } from 'd3-selection'
import { zoom } from 'd3-zoom'
import { drag } from 'd3-drag'
import SingleNestedGraphVisualizer from './single-visualizer'

export default class OperationalNestedGraphVisualizer extends SingleNestedGraphVisualizer {
  setXGridHandler () {
    const dragged = (d, i) => {
      d.position = event.x
      this.svgGrp.select(`line#grid-x${i}`)
        .attr('x1', d.position)
        .attr('x2', d.position)
      this.svgGrp.select(`circle#grid-x${i}-handle`)
        .attr('cx', d.position)
    }
    this.svgGrp.selectAll('circle.grid-x-handle')
      .call(drag()
        // .on('start', dragStarted)
        .on('drag', dragged)
        // .on('end', dragEnded)
      )
  }

  setYGridHandler () {
    const dragged = (d, i) => {
      d.position = event.y
      this.svgGrp.select(`line#grid-y${i}`)
        .attr('y1', d.position)
        .attr('y2', d.position)
      this.svgGrp.select(`circle#grid-y${i}-handle`)
        .attr('cy', d.position)
    }
    this.svgGrp.selectAll('circle.grid-y-handle')
      .call(drag()
        // .on('start', dragStarted)
        .on('drag', dragged)
        // .on('end', dragEnded)
      )
  }

  setSVGZoom () {
    this.svg.call(zoom()
      .scaleExtent([1 / 4, 5])
      .translateExtent([[-150, -150], [2000, 2000]])
      .on('zoom', () => this.svgGrp.attr('transform', event.transform))
    )
  }

  setOperationHandler (graphData) {
    this.setXGridHandler()
    this.setYGridHandler()
    this.setSVGZoom()
  }
}
