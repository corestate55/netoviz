/**
 * @file Definition of deep nested graph with node aggregation.
 */

import DeepNestedGraph from './deep-graph'
import AggregatedNestedGraphNode from './aggregate-node'

/**
 * Deep nested graph with node aggregation.
 * @extends {DeepNestedGraph}
 */
class AggregatedGraph extends DeepNestedGraph {
  /**
   * Replace aggregated children paths to aggregated node path.
   * @param {DeepNestedGraphNode} targetNode - Target node.
   * @param {Array<DeepNestedGraphNode>} childNodes - To be replaced nodes.
   *     (children of target)
   * @param {AggregatedNestedGraphNode} aggregatedNode - Replacement. (aggregated node)
   * @private
   */
  _replaceChildrenByAggregatedNode(targetNode, childNodes, aggregatedNode) {
    // remove targetNodes from targetNode.children
    const targetNodePaths = childNodes.map(d => d.path)
    targetNode.children = targetNode.children.filter(
      path => !targetNodePaths.includes(path)
    )
    // add aggregatedNode instead of targetNodes
    targetNode.children.push(aggregatedNode.path)
  }

  /**
   * Make node name of aggregated node.
   * @param {DeepNestedGraphNode} targetNode - Target node.
   * @param {CombinedClassifier} combinedClassifier - Classifier for children.
   * @prop {string} classifier.family - Family relation to classify.
   * @returns {string} Name of aggregated node.
   * @private
   */
  _aggregatedNodeName(targetNode, combinedClassifier) {
    // head of [parents, children, target] or F(false/fail)
    const familyHead = combinedClassifier.family
      ? combinedClassifier.family[0].toUpperCase()
      : 'F'
    return `Agr:${targetNode.name}:${familyHead}`
  }

  /**
   * Aggregate (children) nodes.
   * @param {DeepNestedGraphNode} targetNode - Target node.
   * @param {Array<DeepNestedGraphNode>} childNodes - Children to be aggregated.
   * @param {CombinedClassifier} combinedClassifier - Classifier
   * @returns {AggregatedNestedGraphNode} Aggregated Node
   * @private
   */
  _makeAggregateNode(targetNode, childNodes, combinedClassifier) {
    const name = this._aggregatedNodeName(targetNode, combinedClassifier)
    const makeFamily = family => {
      // pseudo FamilyRelation instance (omit .degree)
      return family ? { relation: family } : null
    }
    /** @type {TopologyGraphNodeData} */
    const nodeData = {
      type: 'node',
      name,
      family: makeFamily(combinedClassifier.family),
      path: [combinedClassifier.layerPath, name].join(`__`), // MUST be unique
      id: 0, // dummy, not used in nested graph
      parents: this.reverse ? [] : [targetNode.path],
      children: this.reverse ? [targetNode.path] : [],
      diffState: {
        forward: 'kept',
        backward: 'kept',
        pair: {}
      }
    }
    const aggregatedNode = new AggregatedNestedGraphNode(
      nodeData,
      this.reverse,
      childNodes
    )
    this._replaceChildrenByAggregatedNode(
      targetNode,
      childNodes,
      aggregatedNode
    )
    return aggregatedNode
  }

  /**
   * Make unique layer-path list of nodes.
   * @param {Array<DeepNestedGraphNode>} nodes - Nodes.
   * @returns {Array<string>} layer-paths of nodes.
   * @private
   */
  _uniqLayerPaths(nodes) {
    return Array.from(new Set(nodes.map(d => d.layerPath())))
  }

  /**
   * Classify (filter) nodes with classifier function.
   * @param {Array<DeepNestedGraphNode>} nodes - Set of nodes.
   * @param {Object} combinedClassifier - Classifier
   * @prop {function} classifierInfo.callback - Function to classify a node.
   * @returns {Array<DeepNestedGraphNode>} - Filtered nodes.
   * @private
   */
  _classifyAggregateTarget(nodes, combinedClassifier) {
    return nodes.filter(combinedClassifier.callback)
  }

  /**
   * Make a classifier with `family` attribute.
   * @param {string} family - Value of family.
   * @param {function} callback - Classifier function.
   * @returns {FamilyClassifier} A family classifier.
   * @private
   */
  _familyClassifier(family, callback) {
    /**
     * @typedef {Object} FamilyClassifier
     * @prop {string} param - Name of classifier parameter.
     * @prop {string} family - Family value to classify. (condition)
     * @prop {function} callback - Function to classify a node.
     */
    return { param: 'family', family, callback }
  }

  /**
   * Make classifiers for all `family` patterns.
   * @returns {Array<Object>} Family classifiers.
   * @private
   */
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

  /**
   * Make a classifier with layer of node.
   * @param {string} layerPath - Layer path of (children) node.
   * @param {function} callback - Classifier function.
   * @returns {LayerClassifier} A layer classifier.
   * @private
   */
  _layerClassifier(layerPath, callback) {
    /**
     * @typedef {Object} LayerClassifier
     * @prop {string} param - Name of classifier parameter.
     * @prop {string} layerPath - Name of layer path (in children).
     * @prop {function} callback - Function to classify a node.
     */
    return { param: 'layerPath', layerPath, callback }
  }

  /**
   * Make classifiers for all 'layer path' pattern.
   * @param {Array<string>} layerPaths - Layers of (children) nodes.
   * @returns {Array<Object>} Layer classifiers.
   * @private
   */
  _makeLayerClassifiers(layerPaths) {
    const layerClassifierCB = layerPath => d => d.layerPath() === layerPath
    // partial application for each layerPath to get layer-classifier-callback
    return layerPaths.map(layerPath =>
      this._layerClassifier(layerPath, layerClassifierCB(layerPath))
    )
  }

  /**
   * Make production set of classifier sets.
   * @param {Array<Object>} classifiers1 - Classifier set 1.
   * @param {Array<Object>} classifiers2 - Classifier set 2.
   * @returns {Array<Array<Object>>} Production set
   *     of classifier sets.
   * @private
   */
  _makeClassifierProduction(classifiers1, classifiers2) {
    // make product set:
    // ex) classifiers1 = [c11, c12], classifiers2 = [c21, c22]
    // => return [[c11, c21], [c11, c22], [c12, c21], [c12, c22]]
    return classifiers1
      .map(c1 => classifiers2.map(c2 => [c1, c2])) // make product set
      .reduce((acc, classifier) => [...acc, ...classifier], []) // flatten
  }

  /**
   * Make a combined classifier.
   * @param {Array<Object>} classifiers - a pair of classifier,
   *     [familyClassifier, layerClassifier]
   * @returns {CombinedClassifier}
   * @private
   */
  _combinedClassifier(classifiers) {
    /**
     * @typedef {Object} CombinedClassifier
     * @prop {string} family - Family condition.
     * @prop {string} layerPath - Layer (in children) condition.
     * @prop {function} callback - Combined function to classify a node.
     */
    // merge param
    const combinedClassifier = {}
    classifiers.forEach(classifier => {
      combinedClassifier[classifier.param] = classifier[classifier.param]
    })
    // combine classifier functions
    combinedClassifier.callback = classifiers.reduce(
      (acc, classifier) => d => classifier.callback(d) && acc(d),
      () => true
    )
    return combinedClassifier
  }

  /**
   * Make classifier which combines two (family and layer) classifier.
   * It has all properties specified `params` of a classifier,
   * and combined callback functions to classify a node.
   * @param {Array<DeepNestedGraphNode>} childNodes - Nodes to be classified.
   * @returns {Array<CombinedClassifier>} Array of classifier info.
   * @private
   */
  _makeCombinedClassifiers(childNodes) {
    const childrenLayerPaths = this._uniqLayerPaths(childNodes)
    const classifierCombinations = this._makeClassifierProduction(
      this._makeFamilyClassifiers(),
      this._makeLayerClassifiers(childrenLayerPaths)
    )
    return classifierCombinations.map(classifiers =>
      this._combinedClassifier(classifiers)
    )
  }

  /**
   * Aggregate child nodes
   * @param {DeepNestedGraphNode} targetNode - Target node.
   * @param {Array<string>} childNodePaths - Paths of children.
   * @returns {Array<string>} Paths of children after node aggregation.
   * @private
   */
  _aggregateChildNodes(targetNode, childNodePaths) {
    if (childNodePaths.length <= 2) {
      return childNodePaths
    }

    const childNodes = this.mapPathsToNodes(childNodePaths)
    const combinedClassifiers = this._makeCombinedClassifiers(childNodes)
    const aggregatedNodes = []
    let passNodes = []

    for (const combinedClassifier of combinedClassifiers) {
      const classifiedChildNodes = this._classifyAggregateTarget(
        childNodes,
        combinedClassifier
      )
      // don't aggregate if length=0(empty), length=1(single node)
      if (classifiedChildNodes.length < 2) {
        passNodes = passNodes.concat(classifiedChildNodes)
        continue
      }
      // Aggregate: N (targetNodes) -> 1 (aggregatedNode)
      const aggregatedNode = this._makeAggregateNode(
        targetNode,
        classifiedChildNodes,
        combinedClassifier
      )
      aggregatedNodes.push(aggregatedNode)
    }
    // Append aggregated nodes to nodes (node list)
    this.nodes = this.nodes.concat(aggregatedNodes)
    const path = d => d.path
    return passNodes.map(path).concat(aggregatedNodes.map(path))
  }

  /**
   *  @override
   */
  childNodePathsToCalcPosition(node, layerOrder) {
    const childNodePaths = super.childNodePathsToCalcPosition(node, layerOrder)
    return this._aggregateChildNodes(node, childNodePaths)
  }
}

export default AggregatedGraph
