/**
 * @file Data converter for nested graph.
 */

import DeepNestedGraph from './deep-graph'
import AggregatedGraph from './aggregate-graph'

/**
 * Convert topology graph data to nested graph data.
 * @param {NestedGraphQuery} graphQuery - Dictionary of get request properties.
 * @returns {NestedGraphData} Graph data for nested view.
 */
const toNestedGraphData = graphQuery => {
  const nestedGraph = graphQuery.aggregate
    ? new AggregatedGraph(graphQuery)
    : new DeepNestedGraph(graphQuery)
  nestedGraph.initialize()
  return nestedGraph.toData()
}

export default toNestedGraphData
