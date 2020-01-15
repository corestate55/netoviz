/**
 * @file Data converter for dependency graph.
 */

import DependencyGraph from './graph'

/**
 * Convert topology graph data to nested graph data.
 * @param {DependencyGraphQuery} graphQuery - Dictionary of get request properties.
 * @returns {DependencyGraphData}
 */
const toDependencyGraphData = graphQuery => {
  const depGraph = new DependencyGraph(graphQuery)
  return depGraph.toData()
}

export default toDependencyGraphData
