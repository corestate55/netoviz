/**
 * @file Data converter for topology graph.
 */

import TopologyGraphs from './graphs'

/**
 * Convert topology data (RFC8345) to topology graph data.
 * @param {RfcTopologyData} rfcTopologyData RFC8345 topology data.
 * @returns {TopologyGraphsData} Graph data for topology view.
 */
const toTopologyGraphsData = rfcTopologyData => {
  const graphs = new TopologyGraphs(rfcTopologyData)
  return graphs.toData()
}

export default toTopologyGraphsData
