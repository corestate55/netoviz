/**
 * @file Definition of deep nested graph.
 */

import markFamilyWithTarget from '../common/family-maker'
import ShallowNestedTopology from './shallow-topology'
import DeepNestedNode from './deep-node'

/**
 * Deep nested graph.
 * @extends {ShallowNestedTopology}
 */
class DeepNestedTopology extends ShallowNestedTopology {
  /**
   * @param {NestedGraphQuery} graphQuery - Graph data and options.
   */
  constructor(graphQuery) {
    super(graphQuery)
    /** @type {number} */
    this.baseDepth = graphQuery.depth
    /** @type {string} */
    this.target = graphQuery.target
    /** @type {string} */
    this.layer = graphQuery.layer // optional, layer(network) name in target node (for drill-down)
  }

  /**
   * @override
   */
  beforeCalcRootNodePosition() {
    // It must check family after setNodes(),
    // Because, it "reverse" parent/children relation.
    markFamilyWithTarget(this.nodes, this.target, this.layer)
  }

  /**
   * @override
   */
  setNodes() {
    this.setNodesAs(node => new DeepNestedNode(node, this.reverse))
  }

  /**
   * Split node.
   * @param {DeepNestedNode} parentNode - Target node to split.
   * @param {DeepNestedNode} childNode - A child of target node.
   * @returns {DeepNestedNode} Split (new) node.
   * @protected
   */
  splitNode(parentNode, childNode) {
    // console.log(`  ** child: ${childNode.path} has ${childNode.numberOfParentNodes()} parent nodes : `, childNode.parents)
    if (parentNode.split <= 0 && childNode.numberOfParentNodes() <= 1) {
      return childNode
    }
    // console.log('  ** child has multi-parents -> split')
    const splitChildNode = childNode.splitNodeByParent(parentNode.path)
    this.nodes.push(splitChildNode)
    // console.log(`  ** splitChild : `, splitChildNode)
    parentNode.renameChildPath(childNode.path, splitChildNode.path)
    // console.log(`  ** parent :`, parentNode)
    return splitChildNode
  }

  /**
   * @override
   * @param {DeepNestedNode} node
   */
  isLeaf(node) {
    // simple leaf definition: node that does not have child is leaf.
    return node.childNodePaths().length < 1
  }

  /**
   * Check if current layer order overs maximum depth (base depth).
   * @param {number} layerOrder - Order of layer.
   * @returns {boolean} True if Layer order is lager than base depth.
   * @private
   */
  _overDepth(layerOrder) {
    return layerOrder >= (this.baseDepth - 1) * 2
  }

  /**
   * Check if current layer order is between layer-contained and under max depth.
   * @param {number} layerOrder - Order of layer.
   * @returns {boolean} True if layer order is in target layer order.
   * @private
   */
  _inTargetDepth(layerOrder) {
    return (
      (this.baseDepth - 1) * 2 <= layerOrder && layerOrder < this.baseDepth * 2
    )
  }

  /**
   * @override
   * @param {DeepNestedNode} node
   * @param {number} layerOrder
   */
  assumeAsLeaf(node, layerOrder) {
    // Layer depth selection for deep nested graph.
    // If depth of the node (layerOrder) is lager than requested depth,
    // the node is assumes as leaf node (ignore subtree).
    if (node.family) {
      return this.isLeaf(node)
    }
    return this._overDepth(layerOrder) || this.isLeaf(node)
  }

  /**
   * @override
   * @param {DeepNestedNode} node
   * @param {number} layerOrder
   */
  childNodePathsToCalcPosition(node, layerOrder) {
    if (this._inTargetDepth(layerOrder) || !this._overDepth(layerOrder)) {
      return node.childNodePaths()
    }
    return node.childNodePaths().filter(childNodePath => {
      const childNode = this.findNodeByPath(childNodePath)
      const result =
        childNode && // ignore if childNodePath not found
        childNode.family && // ignore childNode is not a family of target
        // select family of target, from root (parent) until child of target:
        // root(parent)-...-parent-target-child <-select ignore-> -child-...-child
        (childNode.family.relation !== 'children' ||
          childNode.family.degree < 3)
      this.consoleDebug(
        layerOrder,
        'childNodePathsToCalcPosition',
        `child=${childNodePath}, family?=${childNode.family}, result=${result}`
      )
      return result
    })
  }

  /**
   * @override
   * @param {DeepNestedNode} parentNode
   * @param {string} childNodePath
   */
  childNodeFrom(parentNode, childNodePath) {
    const childNode = /** @type {DeepNestedNode} */ this.findNodeByPath(
      childNodePath
    )
    if (!childNode) {
      console.error(`child ${childNodePath} not found in ${parentNode.path}`)
    }
    // split multi-parents child node to single parent node
    return this.splitNode(parentNode, childNode)
  }
}

export default DeepNestedTopology
