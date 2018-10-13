'use strict'

import { OperationalVisualizer } from './operational-visualizer'
import * as cln from 'clone'
import * as d3 from 'd3'
const BaseContainer = require('../base')
const DiffState = require('../diff-state')

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
    d3.select('div#visualizer') // clear all graphs
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

      // old/new-diff-view
      // const diffSelectedGraphs = this.selectByDiffState(graph)
      // for (const graph of diffSelectedGraphs) {
      //   const singleGraphVisualizer = new OperationalVisualizer(graph, callback)
      //   singleGraphVisualizer.startSimulation()
      // }
    }
  }

  drawLayerSelector () {
    // clear layer selector
    d3.select('div#layer-selector') // clear all layers
      .selectAll('li')
      .remove()

    const layerList = d3.select('div#layer-selector').append('ul')
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

  selectByDiffState (graph) {
    const selectedGraphs = []
    const diffState = new DiffState(graph.diffState)
    if ('diffState' in graph && diffState.detect() === 'changed') {
      const deletedGraph = this.pickGraphObjBy(graph, 'deleted')
      selectedGraphs.push(deletedGraph)
      const addedGraph = this.pickGraphObjBy(graph, 'added')
      selectedGraphs.push(addedGraph)
    } else {
      // if graph does not have diffState
      // or graph has diffState that is added/deleted/kept.
      selectedGraphs.push(graph)
    }
    return selectedGraphs
  }

  pickGraphObjBy (graph, pickState) {
    let dupGraph = cln.clonePrototype(graph) // copy (deep clone with prototype)
    const pickStates = ['changed', 'kept', pickState]
    // pick-up node/link objects
    const nodes = graph.nodes.filter(
      node => {
        const diffState = new DiffState(node.diffState)
        return pickStates.includes(diffState.detect())
      }
    )
    const links = graph.links.filter(
      link => {
        const diffState = new DiffState(link.diffState)
        return pickStates.includes(diffState.detect())
      }
    )
    // set nodes/links and return graph object
    dupGraph.nodes = nodes
    dupGraph.links = links
    return dupGraph
  }
}
