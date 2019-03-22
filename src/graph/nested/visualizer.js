import { json } from 'd3-fetch'
import OperationalNestedGraphVisualizer from './operational-visualizer'

export default class NestedGraphVisualizer extends OperationalNestedGraphVisualizer {
  apiUrl (jsonName, reverse) {
    return `graph/nested/${jsonName}?reverse=${reverse}`
  }

  drawJsonModel (jsonName, alert, reverse) {
    const url = this.apiUrl(jsonName, reverse)
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

  saveLayout (jsonName, reverse) {
    const url = this.apiUrl(jsonName, reverse)
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

  clearAllAlertHighlight () {
    this.svgGrp.selectAll('.selected')
      .classed('selected', false)
      .style('fill', d => this.colorOfNode(d))
  }

  highlight (node) {
    let selector = ''
    if (node.type === 'node') {
      selector = `rect[id='${node.path}']`
    } else {
      selector = `circle[id='${node.path}']`
    }
    this.svgGrp.selectAll(selector)
      .classed('selected', true)
      .style('fill', null)
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
  }

  highlightByAlert (alert) {
    // this.graphData = json data
    // assign at this.setOperationHandler()
    if (!alert || !this.graphData) {
      return
    }
    this.clearWarning()
    const alertedNodes = this.graphData.nodes.filter(node => {
      return node.name === alert.host
    })
    if (alertedNodes.length > 0) {
      for (const alertedNode of alertedNodes) {
        this.highlight(alertedNode)
      }
    } else {
      const message = `Alerted host: [${alert.host}] is not found.`
      this.makeWarningMessage(message)
      console.log(message)
    }
  }
}
