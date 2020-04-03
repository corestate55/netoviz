/**
 * @file Definition of node for distance graph.
 */

import ForceSimulationNode from '../force-simulation/node'

/**
 * @typedef {DistanceNode} DistanceNodeData
 * @extends {ForceSimulationNode}
 */
/**
 * Node of distance graph.
 */
class DistanceNode extends ForceSimulationNode {
  /**
   * @param {ForceSimulationNodeData} nodeData - Node data.
   */
  constructor(nodeData) {
    super(nodeData)

    /** @type {FamilyRelation} */
    this.family = nodeData.family || {}
    /** @type {NeighborRelation} */
    this.neighbor = nodeData.neighbor || {}
  }

  /**
   * Pick layer name from path.
   * @returns {string} - Layer name.
   * @public
   */
  layerPath() {
    return this.path.split('__').shift()
  }

  /**
   * Check node has relation with target.
   * @returns {boolean} True if this node has family or neighbor relation.
   * @public
   */
  hasTargetRelation() {
    return Boolean(
      Object.keys(this.family).length || Object.keys(this.neighbor).length
    )
  }
}

export default DistanceNode
