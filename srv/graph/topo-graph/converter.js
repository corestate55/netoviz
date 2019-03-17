import Graphs from './graphs'

export default class TopologyGraphConverter {
  constructor (graphData) {
    this.graphs = new Graphs(graphData)
  }

  toData () {
    return this.graphs.graphs
  }
}
