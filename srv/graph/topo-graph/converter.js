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
  const graphDataString = await graphDataCB()
  const topoGraphConverter = new TopologyGraphConverter(
    JSON.parse(graphDataString)
  )
  return JSON.stringify(topoGraphConverter.toData())
}

export default convertTopologyGraphData
