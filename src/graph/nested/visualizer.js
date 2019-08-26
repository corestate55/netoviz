import { json } from 'd3-fetch'
import OperationalNestedGraphVisualizer from './operational-visualizer'

export default class NestedGraphVisualizer extends OperationalNestedGraphVisualizer {
  apiUrl (jsonName, reverse, depth, alert) {
    const baseUrl = `graph/nested/${jsonName}?reverse=${reverse}&depth=${depth}`
    const targetOption = alert ? `&target=${alert.host}` : ''
    return baseUrl + targetOption
  }

  drawJsonModel (jsonName, alert, reverse, depth) {
    const url = this.apiUrl(jsonName, reverse, depth, alert)
    console.log(`[nested] query ${url}`)
    json(url).then(
      graphData => {
        this.clearCanvas()
        this.makeGraphObjects(graphData)
        this.setOperationHandler(graphData)
        this.highlightByAlert(alert)
      },
      error => {
        throw error
      }
    )
  }

  saveLayout (jsonName, reverse, depth) {
    const url = this.apiUrl(jsonName, reverse, depth)
    const layoutData = {
      x: this.xGrids.map(d => d.position),
      y: this.yGrids.map(d => d.position)
    }
    console.log(`[nested] query ${url}`)
    json(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(layoutData)
    }).then(response => console.log(response.message))
  }

  highlightParentOfInoperativeNodes (alertNodes) {
    // search only nodes (ignore tp)
    for (const alertNode of alertNodes.filter(node => node.type === 'node')) {
      const parentsFromInoperative = []
      // parents/children of inoperative node are not processed
      // it is constant whether reverse is true or not.
      for (const parentPath of alertNode.parents) {
        const operativeParent = this.findOperativeNodeByPath(parentPath)
        if (operativeParent) {
          this.highlight(operativeParent, 'selected-parents')
        } else {
          const inoperativeParent = this.findInoperativeNodeByPath(parentPath)
          parentsFromInoperative.push(inoperativeParent)
        }
      }
      this.highlightParentOfInoperativeNodes(parentsFromInoperative)
    }
  }

  highlightParentsByAlert (alert) {
    const message = `Alerted host: [${alert.host}] is not found.`
    this.makeWarningMessage(message)
    const alertNodes = this.inoperativeNodesByName(alert.host)
    this.highlightParentOfInoperativeNodes(alertNodes)
  }

  highlightByAlert (alert) {
    // this.graphData = json data
    // assign at this.setOperationHandler()
    if (!alert || !this.graphData) {
      return
    }
    this.clearWarningMessage()
    const alertNodes = this.operativeNodesByName(alert.host)
    if (alertNodes.length > 0) {
      for (const alertNode of alertNodes) {
        this.highlight(alertNode, 'selected')
      }
    } else {
      this.highlightParentsByAlert(alert)
    }
  }
}
