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
    // head of [parents, children, target] or F(false/fail)
    const familyHead = classifier.family
      ? classifier.family[0].toUpperCase()
      : 'F'
    return `Agr:${parentNode.name}:${familyHead}`
  }

  _makeAggregateNode(parentNode, targetNodes, classifier) {
    const name = this._aggregatedNodeName(parentNode, classifier)
    const makeFamily = family => {
      // pseudo FamilyRelation instance (omit .degree)
      return family ? { relation: family } : null
    }
    const nodeData = {
      type: 'node',
      name,
      family: makeFamily(classifier.family),
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

  _makeFamilyDetectors() {
    return ['parents', 'children', 'target', null].map(family => {
      return family
        ? {
            param: 'family',
            family,
            detector: d =>
              d.family && d.family.relation && d.family.relation === family
          }
        : {
            param: 'family',
            family: null,
            detector: d => !d.family || !d.family.relation
          }
    })
  }

  _makeLayerDetectors(layerPaths) {
    return layerPaths.map(layerPath => ({
      param: 'layerPath',
      layerPath,
      detector: d => d.layerPath() === layerPath
    }))
  }

  _makeDetectorProduction(detector1, detector2) {
    // make product set:
    // ex) detector1 = [d11, d12], detector2 = [d21, d22]
    // => return [[d11, d21], [d11, d22], [d12, d21], [d12, d22]]
    return detector1
      .map(d1 => detector2.map(d2 => [d1, d2])) // make product set
      .reduce((acc, classifier) => [...acc, ...classifier], []) // flatten
  }

  _makeClassifiers(childNodes) {
    const childrenLayerPaths = this._uniqLayerPaths(childNodes)
    const detectorCombinations = this._makeDetectorProduction(
      this._makeFamilyDetectors(),
      this._makeLayerDetectors(childrenLayerPaths)
    )

    return detectorCombinations.map(detectors => {
      // detectors = pair of detector : [familyDetector, layerDetector]
      const classifier = {}
      detectors.forEach(detector => {
        classifier[detector.param] = detector[detector.param]
      })
      classifier.callback = detectors.reduce(
        (acc, detector) => d => detector.detector(d) && acc(d),
        () => true
      )
      return classifier
    })
  }

  _aggregateChildNodes(parentNode, childNodePaths) {
    if (childNodePaths.length <= 3) {
      return childNodePaths
    }

    const childNodes = this.mapPathsToNodes(childNodePaths)
    const aggregatedNodes = []
    let passNodes = []

    for (const classifier of this._makeClassifiers(childNodes)) {
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
    // Append aggregated nodes to nodes (node list)
    this.nodes = this.nodes.concat(aggregatedNodes)
    const path = d => d.path
    return passNodes.map(path).concat(aggregatedNodes.map(path))
  }

  childNodePathsToCalcPosition(node, layerOrder) {
    const childNodePaths = super.childNodePathsToCalcPosition(node, layerOrder)
    return this._aggregateChildNodes(node, childNodePaths)
  }
}
