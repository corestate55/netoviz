'use strict'

import { select } from 'd3-selection'
import { json } from 'd3-fetch'
import { interval } from 'd3-timer'
import PositionCache from './position-cache'
import OperationalVisualizer from './operational-visualizer'
import BaseContainer from '~/server/graph/common/base'

export default class GraphVisualizer extends BaseContainer {
  constructor() {
    super()
    this.positionCache = new PositionCache()
    this.graphVisualizers = []
  }

  drawJsonModel(jsonName, alert, graphsCallBack) {
    json(`/api/graph/topology/${jsonName}`).then(
      graphData => {
        // graph object data to draw converted from topology json
        this.graphs = graphData

        // for debug
        // console.log('graphs: ', this.graphs)

        // set auto save fixed node position function
        this.storageKey = `netoviz-${jsonName}`
        interval(() => {
          this.positionCache.saveGraphs(this.storageKey, this.graphs)
        }, 5000)
        // hook before draw
        graphsCallBack(graphData)
        // draw
        this.drawGraphs()
        this.highlightByAlert(alert)
      },
      error => {
        throw error
      }
    )
  }

  findGraphNodeByPath(path) {
    const listOfNodes = this.graphs.map(graph => graph.nodes)
    const nodes = this.flatten(listOfNodes)
    return nodes.find(d => d.path === path)
  }

  drawGraphs() {
    // clear graphs
    select('div#visualizer') // clear all graphs
      .selectAll('div.network-layer')
      .remove()

    // hand-over the operation through all layers
    // NOTICE: BIND `this`
    const callback = path => this.findGraphNodeByPath(path)
    // entry-point: draw each layer
    for (const graph of this.graphs) {
      // single-diff-view
      const graphVisualizer = new OperationalVisualizer(graph, callback)
      this.positionCache.loadToGraph(this.storageKey, graph, graphVisualizer)
      graphVisualizer.restartSimulation()
      this.graphVisualizers.push(graphVisualizer)
    }
  }

  _forEachVisualizer(callback) {
    this.graphVisualizers.forEach(callback)
  }

  // alias (need to call from UI)
  clearAllHighlight() {
    this.clearAllGraphsHighlight()
  }

  clearAllGraphsHighlight() {
    // clear all highlight
    this._forEachVisualizer(vis => vis.clearHighlight())
  }

  clearAllGraphsWarningMessage() {
    this._forEachVisualizer(vis => vis.clearWarningMessage())
  }

  findGraphVisualizerByName(name) {
    return this.graphVisualizers.find(d => d.graph.name === name)
  }

  highlightByAlert(alert) {
    if (!alert || !this.graphs) {
      return
    }
    this.clearAllGraphsHighlight()
    // find and select (highlight) a node
    //   layer(graph) order is assumed as high -> low
    //   search the node to highlight from low layer
    let targetNode = null
    for (const layer of this.graphs.reverse()) {
      const visualizer = this.findGraphVisualizerByName(layer.name)
      targetNode = visualizer.nodeTypeNodes().find(d => d.name === alert.host)
      if (targetNode) {
        visualizer.highlightNode(targetNode)
        break
      }
    }
    this.clearAllGraphsWarningMessage()
    if (!targetNode) {
      this._forEachVisualizer(vis => {
        const message = `Alerted host: [${alert.host}] is not found.`
        vis.makeWarningMessage(message)
      })
    }
  }
}
