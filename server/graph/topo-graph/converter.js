import Graphs from './graphs'

const convertTopologyGraphData = graphData => {
  const graphs = new Graphs(graphData)
  return graphs.graphs
}

export default convertTopologyGraphData
