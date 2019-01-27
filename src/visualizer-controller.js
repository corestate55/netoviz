'use strict'

import { GraphVisualizer } from './topo-graph/visualizer'
import { DepGraphVisualizer } from './dep-graph/visualizer'
import './css/topo-graph.scss'
import './css/dep-graph.scss'

export class VisualizerController {
  constructor () {
    this.visualizerOf = {
      'Topology': new GraphVisualizer(),
      'Dependency': new DepGraphVisualizer()
    }
    this.visualizerKey = undefined
    this.jsonName = ''
  }

  drawGraph () {
    this.visualizerOf[this.visualizerKey].drawJsonModel(this.jsonName)
  }

  startApp (visualizerKey, modelFile) {
    if (visualizerKey && modelFile) {
      this.visualizerKey = visualizerKey
      this.jsonName = modelFile
      this.drawGraph()
    }
  }
}
