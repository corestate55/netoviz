/**
 * @file Definition of aggregated Node.
 */

import AggregateNodeAttribute from '../topo-model/node-aggr-attr'
import DeepNestedGraphNode from './deep-node'

/**
 * Aggregated Node
 * @extends {DeepNestedGraphNode}
 * @see {@link AggregatedGraph}
 */
class AggregateGraphNode extends DeepNestedGraphNode {
  /**
   * @param {Object} nodeData - Node data.
   * @param {boolean} reverse - Flag for top/bottom view selection.
   * @param {Array<DeepNestedGraphNode>} aggregateNodes - Nodes to be aggregated.
   */
  constructor(nodeData, reverse, aggregateNodes) {
    super(nodeData, reverse)
    this._aggregateWith(aggregateNodes)
  }

  /**
   * Set node attribution from nodes to aggregate.
   * @param {Array<DeepNestedGraphNode>} aggregateNodes - Nodes to be aggregated.
   * @private
   */
  _aggregateWith(aggregateNodes) {
    /** @type {AggregateNodeAttribute} */
    this.attribute = new AggregateNodeAttribute({
      aggregates: aggregateNodes.map(node => ({
        name: node.name,
        path: node.path
      }))
    })
  }
}

export default AggregateGraphNode
