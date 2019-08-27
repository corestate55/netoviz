import Graphs from './graphs'

class TopologyGraphConverter {
  constructor (graphData) {
    this.graphs = new Graphs(graphData)
  }

  toData () {
    return this.graphs.graphs
  }
}

const convertTopologyGraphData = async graphDataCB => {
  const graphData = await graphDataCB()
  const topoGraphConverter = new TopologyGraphConverter(graphData)
  return topoGraphConverter.toData()
}

export default convertTopologyGraphData
