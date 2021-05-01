/**
 * @file Data converter for topology graph.
 */

import ForceSimulationTopology from './topology'

/**
 * Convert topology data (RFC8345) to topology graph data.
 * @param {RfcTopologyData} rfcTopologyData RFC8345 topology data.
 * @returns {ForceSimulationTopologyData} Graph data for topology view.
 */
const toForceSimulationTopologyData = (rfcTopologyData) => {
  const topologyData = new ForceSimulationTopology(rfcTopologyData)
  return topologyData.toData()
}

export default toForceSimulationTopologyData
