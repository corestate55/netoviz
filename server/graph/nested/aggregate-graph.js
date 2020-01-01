import DeepNestedGraph from './deep-graph'
import AggregateGraphNode from './aggregate-node'

export default class AggregatedGraph extends DeepNestedGraph {
  _replaceChildrenByAggregatedNode(parentNode, targetNodes, aggregatedNode) {
    // remove targetNodes from parentNode.children
    const targetNodePaths = targetNodes.map(d => d.path)
    parentNode.children = parentNode.children.filter(
      path => !targetNodePaths.includes(path)
    )
    // add aggregatedNode instead of targetNodes
    parentNode.children.push(aggregatedNode.path)
  }

  _aggregatedNodeName(parentNode, classifier) {
    const family = classifier.family ? 'T' : 'F'
    return `Agr:${parentNode.name}:${family}`
  }

  _makeAggregateNode(parentNode, targetNodes, classifier) {
    const name = this._aggregatedNodeName(parentNode, classifier)
    const nodeData = {
      type: 'node',
      name,
      path: [classifier.layerPath, name].join(`__`), // MUST be unique
      id: 0, // dummy, not used in nested graph
      parents: this.reverse ? [] : [parentNode.path],
      children: this.reverse ? [parentNode.path] : [],
      diffState: {
        forward: 'kept',
        backward: 'kept',
        pair: {}
      }
    }
    const aggregatedNode = new AggregateGraphNode(
      nodeData,
      this.reverse,
      targetNodes
    )
    this._replaceChildrenByAggregatedNode(
      parentNode,
      targetNodes,
      aggregatedNode
    )
    return aggregatedNode
  }

  _uniqLayerPaths(nodes) {
    return Array.from(new Set(nodes.map(d => d.layerPath())))
  }

  _classifyAggregateTarget(childNodes, classifier) {
    return childNodes.filter(classifier.callback)
  }

  _makeClassifiers(childrenLayerPaths) {
    const familyDetections = [d => d.family, d => !d.family]
    const classifiers = []
    for (const layerPath of childrenLayerPaths) {
      for (const familyDetection of familyDetections) {
        classifiers.push({
          layerPath,
          family: familyDetection({ family: true }),
          callback: d => familyDetection(d) && d.layerPath() === layerPath
        })
      }
    }
    return classifiers
  }

  _aggregateChildNodes(parentNode, childNodePaths) {
    if (childNodePaths.length <= 3) {
      return childNodePaths
    }

    const childNodes = this.mapPathsToNodes(childNodePaths)
    const childrenLayerPaths = this._uniqLayerPaths(childNodes)
    const aggregatedNodes = []
    let passNodes = []

    for (const classifier of this._makeClassifiers(childrenLayerPaths)) {
      const targetNodes = this._classifyAggregateTarget(childNodes, classifier)
      // don't aggregate if length=0(empty), length=1(single node)
      if (targetNodes.length < 2) {
        passNodes = passNodes.concat(targetNodes)
        continue
      }
      // Aggregate: N (targetNodes) -> 1 (aggregatedNode)
      const aggregatedNode = this._makeAggregateNode(
        parentNode,
        targetNodes,
        classifier
      )
      aggregatedNodes.push(aggregatedNode)
    }
    // console.log('[_aggrChildNodes] aggregateNodes:', aggregatedNodes)
    // Append aggregated nodes to nodes (node list)
    this.nodes = this.nodes.concat(aggregatedNodes)
    return passNodes.map(d => d.path).concat(aggregatedNodes.map(d => d.path))
  }

  childNodePathsToCalcPosition(node, layerOrder) {
    const childNodePaths = super.childNodePathsToCalcPosition(node, layerOrder)
    return this._aggregateChildNodes(node, childNodePaths)
  }
}
