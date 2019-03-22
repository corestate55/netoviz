import { json } from 'd3-fetch'
import OperationalNestedGraphVisualizer from './operational-visualizer'

export default class NestedGraphVisualizer extends OperationalNestedGraphVisualizer {
  apiUrl (jsonName) {
    return `graph/nested/${jsonName}?reverse=${this.reverse}`
  }

  drawJsonModel (jsonName, alert, reverse) {
    this.reverse = reverse
    const url = this.apiUrl(jsonName)
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
    this.reverse = reverse
    const url = this.apiUrl(jsonName)
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
    for (const className of ['selected', 'selected2']) {
      this.svgGrp.selectAll(`.${className}`)
        .classed(className, false)
        .style('fill', d => this.colorOfNode(d))
    }
  }

  highlight (node, className) {
    let selector = ''
    if (node.type === 'node') {
      selector = `rect[id='${node.path}']`
    } else {
      selector = `circle[id='${node.path}']`
    }
    this.svgGrp.selectAll(selector)
      .classed(className, true)
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

  findOperativeNode (path) {
    return this.graphData.nodes.find(node => node.path === path)
  }

  findInoperativeNode (path) {
    return this.graphData.inoperativeNodes.find(node => node.path === path)
  }

  parentPaths (node) {
    // NOTICE: children/parents selection is OK?
    // parents/children of inoperative node are not processed
    // when converted to graph data in server.
    // a node (in upper layer) refers nodes in lower layer.
    return this.reverse ? node.children : node.parents
  }

  highlightParentOfInoperativeNodes (alertNodes) {
    // search only nodes (ignore tp)
    for (const alertNode of alertNodes.filter(node => node.type === 'node')) {
      const parentPaths = this.parentPaths(alertNode)
      const parentsFromInoperative = []
      for (const parentPath of parentPaths) {
        const operativeParent = this.findOperativeNode(parentPath)
        if (operativeParent) {
          this.highlight(operativeParent, 'selected2')
        } else {
          const inoperativeParent = this.findInoperativeNode(parentPath)
          parentsFromInoperative.push(inoperativeParent)
        }
      }
      this.highlightParentOfInoperativeNodes(parentsFromInoperative)
    }
  }

  highlightParentsByAlert (alert) {
    const alertNodes = this.graphData.inoperativeNodes.filter(node => {
      return node.name === alert.host
    })
    const message = `Alerted host: [${alert.host}] is not found.`
    this.makeWarningMessage(message)
    console.log(message)
    this.highlightParentOfInoperativeNodes(alertNodes)
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
        this.highlight(alertedNode, 'selected')
      }
    } else {
      this.highlightParentsByAlert(alert)
    }
  }
}
