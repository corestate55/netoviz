import { json } from 'd3-fetch'
import OperationalNestedGraphVisualizer from './operational-visualizer'

export default class NestedGraphVisualizer extends OperationalNestedGraphVisualizer {
  apiURI(graphName, jsonName, params) {
    // keep to use in click-hook
    this.jsonName = jsonName
    this.uriParams = params
    return super.apiURI(graphName, jsonName, params)
  }

  apiParamFrom(alert, reverse, depth, layer, aggregate) {
    return {
      target: this.targetNameFromAlert(alert),
      reverse,
      depth,
      layer,
      aggregate
    }
  }

  // arg: layer is optional (used-in click-hook, to drill-down by click)
  drawJsonModel(jsonName, alert, reverse, depth, layer, fitGrid, aggregate) {
    const param = this.apiParamFrom(alert, reverse, depth, layer, aggregate)
    json(this.apiURI('nested', jsonName, param))
      .then(
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
      .then(() => fitGrid && this.fitGrid())
  }

  saveLayout(jsonName, reverse, depth) {
    const param = this.apiParamFrom(alert, reverse, depth)
    const layoutData = {
      x: this.xGrids.map(d => d.position),
      y: this.yGrids.map(d => d.position)
    }
    json(this.apiURI('nested', jsonName, param), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(layoutData)
    }).then(response => console.log(response.message))
  }

  setUISideNodeClickHook(callback) {
    this.uiSideNodeClickCallback = callback
  }

  nodeClickHook(d) {
    if (typeof this.uiSideNodeClickCallback === 'function') {
      // if this callback exist, redraw event will be arise from UI-side.
      this.uiSideNodeClickCallback(d)
    } else {
      this.drawJsonModel(
        this.jsonName,
        { host: d.name },
        this.uriParams.reverse,
        this.uriParams.depth,
        this.networkPathOf(d.path)
      )
    }
  }

  highlightParentOfInoperativeNodes(alertNodes) {
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

  highlightParentsByAlert(alert) {
    const message = `Alerted host: [${alert.host}] is not found.`
    this.makeWarningMessage(message)
    const alertNodes = this.inoperativeNodesByName(alert.host)
    this.highlightParentOfInoperativeNodes(alertNodes)
  }

  highlightByAlert(alert) {
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
