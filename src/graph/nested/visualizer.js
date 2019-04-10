import { json } from 'd3-fetch'
import OperationalNestedGraphVisualizer from './operational-visualizer'

export default class NestedGraphVisualizer extends OperationalNestedGraphVisualizer {
  apiUrl (jsonName, reverse, deep) {
    return `graph/nested/${jsonName}?reverse=${reverse}&deep=${deep}`
  }

  drawJsonModel (jsonName, alert, reverse, deep) {
    const url = this.apiUrl(jsonName, reverse, deep)
    console.log(`[nested] query ${url}`)
    json(url).then((graphData) => {
      this.clearCanvas()
      this.makeGraphObjects(graphData)
      this.setOperationHandler(graphData)
      this.highlightByAlert(alert)
    }, (error) => {
      throw error
    })
  }

  saveLayout (jsonName, reverse, deep) {
    const url = this.apiUrl(jsonName, reverse, deep)
    const layoutData = {
      x: this.xGrids.map(d => d.position),
      y: this.yGrids.map(d => d.position)
    }
    console.log(`[nested] query ${url}`)
    json(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(layoutData)
    }).then(response => console.log(response.message))
  }

  clearWarning () {
    this.svg.selectAll('text.warning')
      .remove()
  }

  makeWarningMessage (message) {
    this.svg.selectAll('text.warning')
      .data([{ message: message, x: 10, y: 10 }])
      .enter()
      .append('text')
      .attr('class', 'nest warning')
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .text(d => d.message)
    console.log(message)
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
          this.highlight(operativeParent, 'selected2')
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
    this.clearWarning()
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
