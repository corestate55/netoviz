import { json } from 'd3-fetch'
import OperationalDep2GraphVisualizer from './operational-visualizer'

export default class Dep2GraphVisualizer extends OperationalDep2GraphVisualizer {
  drawJsonModel (jsonName, alert) {
    json(`graph/dependency/${jsonName}`).then((graphData) => {
      this.clearCanvas()
      this.makeGraphObjects(graphData)
      this.setOperationHandler()
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

  _findObjByName (name) {
    return this.reduceDrawGraphDataToList()
      .reverse() // find low layer at first
      .find(d => d.name === name)
  }

  highlightByAlert (alert) {
    if (!alert) {
      return
    }
    const result = this._findObjByName(alert.host)
    if (result) {
      this.clearWarning()
      this.clickHandler(result)
    } else {
      const message = `Alerted host: [${alert.host}] is not found.`
      this.makeWarningMessage(message)
    }
  }
}
