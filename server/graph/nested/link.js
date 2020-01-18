/**
 * @file Definition of Link for nested graph.
 */

import ForceSimulationLink from '../force-simulation/link'

/**
 * Link for nested graph.
 * @extends {ForceSimulationLink}
 */
class NestedLink extends ForceSimulationLink {
  /**
   * Check link is inter specified nodes.
   * @param {Array<ShallowNestedNode>} nodes - Nodes.
   * @returns {boolean} True if this link connects specified nodes.
   */
  availableIn(nodes) {
    if (this.type === 'node-tp') {
      return false // do not use node-tp type link in Nested Graph
    }
    const source = nodes.find(d => d.path === this.sourcePath)
    const target = nodes.find(d => d.path === this.targetPath)
    return Boolean(source && target)
  }
}

export default NestedLink
