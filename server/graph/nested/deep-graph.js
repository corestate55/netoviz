import markFamilyWithTarget from '../common/family-maker'
import ShallowNestedGraph from './shallow-graph'
import DeepNestedGraphNode from './deep-node'

export default class DeepNestedGraph extends ShallowNestedGraph {
  constructor(graphQuery) {
    super(graphQuery.graphData, graphQuery.layoutData, graphQuery.reverse)
    this.baseDepth = graphQuery.depth
    this.target = graphQuery.target
    this.layer = graphQuery.layer // optional, layer(network) name in target node (for drill-down)
  }

  beforeCalcRootNodePosition() {
    // It must check family after setNodes(),
    // Because, it "reverse" parent/children relation.
    markFamilyWithTarget(this.nodes, this.target, this.layer)
  }

  setNodes() {
    this.setNodesAs(this.graphData, node => {
      return new DeepNestedGraphNode(node, this.reverse)
    })
  }

  // childNode = target (to split)
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

  isLeaf(node) {
    // simple leaf definition: node that does not have child is leaf.
    return node.childNodePaths().length < 1
  }

  overDepth(layerOrder) {
    return layerOrder >= (this.baseDepth - 1) * 2
  }

  inTargetDepth(layerOrder) {
    return (
      (this.baseDepth - 1) * 2 <= layerOrder && layerOrder < this.baseDepth * 2
    )
  }

  assumeAsLeaf(node, layerOrder) {
    // Layer depth selection for deep nested graph.
    // If depth of the node (layerOrder) is lager than requested depth,
    // the node is assumes as leaf node (ignore subtree).
    if (node.family) {
      return this.isLeaf(node)
    }
    return this.overDepth(layerOrder) || this.isLeaf(node)
  }

  childNodePathsToCalcPosition(node, layerOrder) {
    if (this.inTargetDepth(layerOrder) || !this.overDepth(layerOrder)) {
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
      this._consoleDebug(
        layerOrder,
        'childNodePathsToCalcPosition',
        `child=${childNodePath}, family?=${childNode.family}, result=${result}`
      )
      return result
    })
  }

  childNodeFrom(parentNode, childNodePath) {
    const childNode = this.findNodeByPath(childNodePath)
    if (!childNode) {
      console.error(`child ${childNodePath} not found in ${parentNode.path}`)
    }
    // split multi-parents child node to single parent node
    return this.splitNode(parentNode, childNode)
  }
}
