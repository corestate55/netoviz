'use strict'

import {Graphs} from './graphs'
import {SingleGraphVisualizer} from './single-visualizer'

export class GraphVisualizer extends Graphs {
  constructor (topoData) {
    super(topoData)
  }

  drawGraphs () {
    // hand-over the operation through all layers
    // NOTICE: BIND `this`
    var callback = path => this.findGraphNodeByPath(path)
    // entrypoint: draw each layer
    this.graphs.forEach(graph => {
      var sgv = new SingleGraphVisualizer(graph, callback)
      sgv.draw()
    })
  }
}
