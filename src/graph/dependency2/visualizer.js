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
      this.clearWarningMessage()
      this.clickHandler(result)
    } else {
      const message = `Alerted host: [${alert.host}] is not found.`
      this.makeWarningMessage(message)
    }
  }
}
