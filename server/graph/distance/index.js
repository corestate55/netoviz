/**
 * @file Data converter for distance graph.
 */

import DistanceTopology from './topology'

/**
 * Convert topology graph data to distance graph data.
 * @param {DistanceGraphQuery} graphQuery - Graph query.
 * @returns {DistanceTopologyData} - Distance graph data.
 */
const toDistanceTopologyData = (graphQuery) => {
  const distanceTopology = new DistanceTopology(graphQuery)
  return distanceTopology.toData()
}

export default toDistanceTopologyData
