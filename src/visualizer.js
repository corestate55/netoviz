'use strict'

import {Graphs} from './graphs'
import {OperationalVisualizer} from './operational-visualizer'
import * as cln from 'clone'
import * as d3 from 'd3'

export class GraphVisualizer extends Graphs {
  constructor (topoData) {
    super(topoData)
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
      singleGraphVisualizer.startSimulation()

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
    if ('diffState' in graph && graph.diffState.detect() === 'changed') {
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
      node => pickStates.includes(node.diffState.detect())
    )
    const links = graph.links.filter(
      link => pickStates.includes(link.diffState.detect())
    )
    // set nodes/links and return graph object
    dupGraph.nodes = nodes
    dupGraph.links = links
    return dupGraph
  }
}
