/**
 * @file Definition of aggregated Node.
 */

import AggregatedNodeAttribute from '../rfc-model/node-aggr-attr'
import DeepNestedNode from './deep-node'

/**
 * Aggregated Node
 * @extends {DeepNestedNode}
 * @see {AggregatedTopology}
 */
class AggregatedNestedNode extends DeepNestedNode {
  /**
   * @param {ForceSimulationNodeData} nodeData - Node data.
   * @param {boolean} reverse - Flag for top/bottom view selection.
   * @param {Array<DeepNestedNode>} aggregateNodes - Nodes to be aggregated.
   */
  constructor(nodeData, reverse, aggregateNodes) {
    super(nodeData, reverse)
    this._aggregateWith(aggregateNodes)
  }

  /**
   * Set node attribution from nodes to aggregate.
   * @param {Array<DeepNestedNode>} aggregateNodes - Nodes to be aggregated.
   * @private
   */
  _aggregateWith(aggregateNodes) {
    /** @type {AggregatedNodeAttribute} */
    this.attribute = new AggregatedNodeAttribute({
      aggregates: aggregateNodes.map((node) => ({
        name: node.name,
        path: node.path
      }))
    })
  }
}

export default AggregatedNestedNode
