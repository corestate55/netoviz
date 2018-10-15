'use strict'

import { OperationalVisualizer } from './operational-visualizer'
import { select } from 'd3-selection'
const BaseContainer = require('../base')

export class GraphVisualizer extends BaseContainer {
  constructor (graphData) {
    super()
    this.graphs = graphData
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
      const singleGraphVisualizer = new OperationalVisualizer(graph, callback)
      singleGraphVisualizer.restartSimulation()
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
