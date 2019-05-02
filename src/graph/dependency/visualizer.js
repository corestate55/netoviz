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

  clearWarning () {
    this.svg.selectAll('text.warning')
      .remove()
  }

  makeWarningMessage (message) {
    this.svg.selectAll('text.warning')
      .data([{ message: message, x: 150, y: 12 }])
      .enter()
      .append('text')
      .attr('class', 'dep warning')
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .text(d => d.message)
    console.log(message)
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
        this.clearWarning()
        this.clickEventHandler(result)
        break
      } else {
        const message = `Alerted host: [${alert.host}] is not found.`
        this.makeWarningMessage(message)
      }
    }
  }
}
