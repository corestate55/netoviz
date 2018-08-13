'use strict'

import {Graphs} from './graphs'
import {OperationalVisualizer} from './operational-visualizer'

export class GraphVisualizer extends Graphs {
  constructor (topoData) {
    super(topoData)
  }

  drawGraphs () {
    // hand-over the operation through all layers
    // NOTICE: BIND `this`
    const callback = path => this.findGraphNodeByPath(path)
    // entrypoint: draw each layer
    for (const graph of this.graphs) {
      const singleGraphVisualizer = new OperationalVisualizer(graph, callback)
      singleGraphVisualizer.startSimulation()
    }
  }
}
