/**
 * @file Data converter for topology graph.
 */
import Graphs from './graphs'

/**
 * Convert topology data (RFC8345) to topology graph data.
 * @param {TopologyGraphData} graphData Graph data for topology view.
 */
const convertTopologyGraphData = graphData => {
  const graphs = new Graphs(graphData)
  return graphs.toData()
}

export default convertTopologyGraphData
