import { json } from 'd3-fetch'
import OperationalDep2GraphVisualizer from './operational-visualizer'

export default class Dep2GraphVisualizer extends OperationalDep2GraphVisualizer {
  apiUrl (jsonName, alert) {
    const targetString = alert && alert.host ? `?target=${alert.host}` : ''
    return `graph/dependency/${jsonName}${targetString}`
  }

  drawJsonModel (jsonName, alert) {
    json(this.apiUrl(jsonName, alert)).then(
      graphData => {
        this.clearCanvas()
        this.makeGraphObjects(graphData)
        this.setOperationHandler()
        this.highlightByAlert(alert)
      },
      error => {
        throw error
      }
    )
  }

  _findNodeObjByName (name) {
    return this.reduceDrawGraphDataToList()
      .reverse() // find low layer at first
      .find(d => d.type === 'node' && d.name === name)
  }

  highlightByAlert (alert) {
    if (!alert || !this.svg) {
      console.log('[dep2] Alert or svg not ready.')
      return
    }
    const result = this._findNodeObjByName(alert.host)
    if (result) {
      this.clearWarningMessage()
      this.clickHandler(result)
    } else {
      const message = `Alerted host: [${alert.host}] is not found.`
      this.clearAllHighlight()
      this.makeWarningMessage(message)
    }
  }
}
