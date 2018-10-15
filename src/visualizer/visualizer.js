'use strict'

import { OperationalVisualizer } from './operational-visualizer'
import { PositionCache } from './position-cache'
import { select } from 'd3-selection'
import { json } from 'd3-request'
import { interval } from 'd3-timer'
const BaseContainer = require('../base')

export class GraphVisualizer extends BaseContainer {
  constructor () {
    super()
    this.posCache = new PositionCache()
  }

  drawJsonModel (jsonName) {
    // URL draw/:jsonName is the API
    // that convert topology json (model/:jsonName)
    // to graph object data by json format.
    json(`draw/${jsonName}`, (error, graphData) => {
      if (error) {
        throw error
      }
      // graph object data to draw converted from topology json
      this.graphs = graphData
      // for debug
      console.log('graphs: ', this.graphs)
      // set auto save fixed node position function
      this.storageKey = `netoviz-${jsonName}`
      interval(() => {
        this.posCache.saveGraphs(this.storageKey, this.graphs)
      }, 5000)
      // draw
      this.drawLayerSelector()
      this.drawGraphs()
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
    }
  }

  drawLayerSelector () {
    // clear layer selector
    select('div#layer-selector') // clear all layers
      .selectAll('li')
      .remove()

    const layerList = select('div#layer-selector').append('ul')
    const idFunc = d => `layer-selector-${d.name}`
    function toggleLayerDisplay (d) {
      const cBox = document.getElementById(idFunc(d))
      document.getElementById(`${d.name}-container`)
        .style.display = cBox.checked ? 'block' : 'none'
    }

    layerList.selectAll('li')
      .data(this.graphs)
      .enter()
      .append('li')
      .append('input')
      .attr('type', 'checkbox')
      .attr('name', 'select-layer')
      .attr('id', idFunc)
      .attr('checked', true)
      .on('click', toggleLayerDisplay)
    layerList.selectAll('li')
      .append('label')
      .attr('for', idFunc)
      .on('click', toggleLayerDisplay)
      .text(d => d.name)
  }
}
