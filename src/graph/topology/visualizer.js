'use strict'

import OperationalVisualizer from './operational-visualizer'
import PositionCache from './position-cache'
import { select } from 'd3-selection'
import { json } from 'd3-fetch'
import { interval } from 'd3-timer'
import BaseContainer from '../../../srv/graph/common/base'

export default class GraphVisualizer extends BaseContainer {
  constructor () {
    super()
    this.posCache = new PositionCache()
    this.graphVisualizers = []
  }

  drawJsonModel (jsonName) {
    json(`graph/topology/${jsonName}`).then((graphData) => {
      // graph object data to draw converted from topology json
      this.graphs = graphData

      // for debug
      // console.log('graphs: ', this.graphs)

      // set auto save fixed node position function
      this.storageKey = `netoviz-${jsonName}`
      interval(() => {
        this.posCache.saveGraphs(this.storageKey, this.graphs)
      }, 5000)
      // draw
      this.drawGraphs()
    }, (error) => {
      throw error
    })
  }

  findGraphNodeByPath (path) {
    const listOfNodes = this.graphs.map(graph => graph.nodes)
    const nodes = this.flatten(listOfNodes)
    return nodes.find(d => d.path === path)
  }

  drawGraphs () {
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
      this.posCache.loadToGraph(this.storageKey, graph, graphVisualizer)
      graphVisualizer.restartSimulation()
      this.graphVisualizers.push(graphVisualizer)
    }
  }

  clearAllHighlight () {
    // clear all highlight
    this.graphVisualizers.forEach(vis => vis.clearHighlight())
  }

  findGraphVisualizerByName (name) {
    return this.graphVisualizers.find(d => d.graph.name === name)
  }

  findNodeByNameInLayer (name, layer) {
    return layer.nodes.find(d => d.name === name)
  }

  highlightByAlert (alert) {
    if (!alert || !this.graphs) {
      return
    }
    this.clearAllHighlight()
    // find and select (highlight) a node
    //   layer(graph) order is assumed as high -> low
    //   search the node to highlight from low layer
    let foundTargetNode = false
    for (const layer of this.graphs.reverse()) {
      const result = this.findNodeByNameInLayer(alert.host, layer)
      if (result) {
        const el = document.getElementById(result.path)
        this.findGraphVisualizerByName(layer.name).highlightNode(el)
        foundTargetNode = true
        break
      }
    }
    this.graphVisualizers.forEach(vis => vis.clearWarningMessage())
    if (!foundTargetNode) {
      this.graphVisualizers.forEach(vis => {
        const message = `Alerted host: [${alert.host}] is not found.`
        vis.makeWarningMessage(message)
      })
    }
  }
}
