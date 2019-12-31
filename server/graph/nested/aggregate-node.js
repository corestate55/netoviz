import AggregateNodeAttribute from '../topo-model/node-aggr-attr'
import DeepNestedGraphNode from './deep-node'

export default class AggregateGraphNode extends DeepNestedGraphNode {
  constructor(nodeData, reverse, aggregateNodes) {
    super(nodeData, reverse)
    this._aggregateWith(aggregateNodes)
  }

  _aggregateWith(aggregateNodes) {
    this.attribute = new AggregateNodeAttribute({
      aggregates: aggregateNodes.map(node => ({
        name: node.name,
        path: node.path
      }))
    })
  }
}
