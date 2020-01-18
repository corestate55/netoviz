/**
 * @file Data converter for dependency graph.
 */

import DependencyTopology from './topology'

/**
 * Convert topology graph data to nested graph data.
 * @param {DependencyGraphQuery} graphQuery - Dictionary of get request properties.
 * @returns {DependencyTopologyData}
 */
const toDependencyTopologyData = graphQuery => {
  const dependencyTopology = new DependencyTopology(graphQuery)
  return dependencyTopology.toData()
}

export default toDependencyTopologyData
