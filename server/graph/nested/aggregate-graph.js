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

  _classifyAggregateTarget(childNodes, classifierInfo) {
    return childNodes.filter(classifierInfo.callback)
  }

  _familyClassifier(family, callback) {
    return { param: 'family', family, callback }
  }

  _makeFamilyClassifiers() {
    const familyClassifierCB1 = family => d =>
      d.family && d.family.relation && d.family.relation === family
    const familyClassifierCB2 = d => !d.family || !d.family.relation

    return ['parents', 'children', 'target', null].map(family => {
      // partial application for each family to get family-classifier-callback
      return family
        ? this._familyClassifier(family, familyClassifierCB1(family))
        : this._familyClassifier(family, familyClassifierCB2)
    })
  }

  _layerClassifier(layerPath, callback) {
    return { param: 'layerPath', layerPath, callback }
  }

  _makeLayerClassifiers(layerPaths) {
    const layerClassifierCB = layerPath => d => d.layerPath() === layerPath
    // partial application for each layerPath to get layer-classifier-callback
    return layerPaths.map(layerPath =>
      this._layerClassifier(layerPath, layerClassifierCB(layerPath))
    )
  }

  _makeClassifierProduction(classifiers1, classifiers2) {
    // make product set:
    // ex) classifiers1 = [c11, c12], classifiers2 = [c21, c22]
    // => return [[c11, c21], [c11, c22], [c12, c21], [c12, c22]]
    return classifiers1
      .map(c1 => classifiers2.map(c2 => [c1, c2])) // make product set
      .reduce((acc, classifier) => [...acc, ...classifier], []) // flatten
  }

  _makeClassifierInfos(childNodes) {
    const childrenLayerPaths = this._uniqLayerPaths(childNodes)
    const classifierCombinations = this._makeClassifierProduction(
      this._makeFamilyClassifiers(),
      this._makeLayerClassifiers(childrenLayerPaths)
    )

    return classifierCombinations.map(classifiers => {
      // classifiers = pair of classifier : [familyClassifier, layerClassifier]
      const classifierInfo = {}
      classifiers.forEach(classifier => {
        classifierInfo[classifier.param] = classifier[classifier.param]
      })
      classifierInfo.callback = classifiers.reduce(
        (acc, classifier) => d => classifier.callback(d) && acc(d),
        () => true
      )
      return classifierInfo
    })
  }

  _aggregateChildNodes(parentNode, childNodePaths) {
    if (childNodePaths.length <= 3) {
      return childNodePaths
    }

    const childNodes = this.mapPathsToNodes(childNodePaths)
    const aggregatedNodes = []
    let passNodes = []

    for (const cInfo of this._makeClassifierInfos(childNodes)) {
      const targetNodes = this._classifyAggregateTarget(childNodes, cInfo)
      // don't aggregate if length=0(empty), length=1(single node)
      if (targetNodes.length < 2) {
        passNodes = passNodes.concat(targetNodes)
        continue
      }
      // Aggregate: N (targetNodes) -> 1 (aggregatedNode)
      const aggregatedNode = this._makeAggregateNode(
        parentNode,
        targetNodes,
        cInfo
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
