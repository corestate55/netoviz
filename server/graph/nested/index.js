/**
 * @file Data converter for nested graph.
 */

import DeepNestedTopology from './deep-topology'
import AggregatedTopology from './aggregated-topology'

/**
 * Convert topology graph data to nested graph data.
 * @param {NestedGraphQuery} graphQuery - Dictionary of get request properties.
 * @returns {NestedTopologyData} Graph data for nested view.
 */
const toNestedTopologyData = (graphQuery) => {
  const nestedTopology = graphQuery.aggregate
    ? new AggregatedTopology(graphQuery)
    : new DeepNestedTopology(graphQuery)
  nestedTopology.initialize()
  return nestedTopology.toData()
}

export default toNestedTopologyData
