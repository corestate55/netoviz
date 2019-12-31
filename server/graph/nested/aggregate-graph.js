import DeepNestedGraph from './deep-graph'
import AggregateGraphNode from './aggregate-node'

export default class AggregatedGraph extends DeepNestedGraph {
  _makeAggregateNode(name, parentNodePath, layerPath, nodes) {
    if (nodes.length < 1) {
      return null
    } else if (nodes.length === 1) {
      return nodes
    }

    const nodeData = {
      type: 'node',
      name,
      path: [layerPath, name].join(`__`), // MUST be unique
      id: 0, // dummy, not used in nested graph
      parents: this.reverse ? [] : [parentNodePath],
      children: this.reverse ? [parentNodePath] : [],
      diffState: {
        forward: 'kept',
        backward: 'kept',
        pair: {}
      }
    }
    return new AggregateGraphNode(nodeData, this.reverse, nodes)
  }

  _aggregateChildNodes(parentNode, childNodePaths) {
    if (childNodePaths.length <= 3) {
      return childNodePaths
    }

    const childNodes = childNodePaths.map(childNodePath => {
      return this.findNodeByPath(childNodePath)
    })
    const layerPathsOfChildren = Array.from(
      new Set(childNodes.map(d => d.layerPath())) // uniq
    )
    const aggregatedNodes = []
    for (const layerPath of layerPathsOfChildren) {
      const aggregatedNode = this._makeAggregateNode(
        `Aggr:${layerPath}:${parentNode.name}`,
        parentNode.path,
        layerPath,
        childNodes.filter(d => d.layerPath() === layerPath)
      )
      if (aggregatedNode) {
        aggregatedNodes.push(aggregatedNode)
      }
    }
    this.nodes = this.nodes.concat(aggregatedNodes)
    return aggregatedNodes.map(d => d.path)
  }

  childNodePathsToCalcPosition(node, layerOrder) {
    const childNodePaths = super.childNodePathsToCalcPosition(node, layerOrder)
    return this._aggregateChildNodes(node, childNodePaths)
  }
}
