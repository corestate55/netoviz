import ShallowNestedGraph from './shallow-graph'
import DeepNestedGraphNode from './deep-node'

export default class DeepNestedGraph extends ShallowNestedGraph {
  constructor (graphData, layoutData, reverse, depth, target) {
    super(graphData, layoutData, reverse)
    this.requestedDepth = depth
    this.target = target
  }

  beforeCalcRootNodePosition () {
    this.markFamilyOfTarget()
  }

  findAndMarkAsFamily (path, relationship) {
    // console.log(`- START ${path} with ${relationship}`)
    const node = this.findNodeByPath(path)
    if (!node) {
      // console.log(`-- node ${path} not found (in findAndMarkAsFamily)`)
      return
    }
    // console.log(`-- mark ${node.path} as ${relationship}`)
    node.family = relationship
    // Find recursively: node.parents or node.children
    for (const familyPath of node[relationship]) {
      // console.log(`-- * next: ${familyPath} as ${relationship} of ${node.path}`)
      this.findAndMarkAsFamily(familyPath, relationship)
    }
  }

  markFamilyOfTarget () {
    const targetNode = this.nodes
      .reverse()
      .find(d => d.type === 'node' && d.name === this.target)
    if (!targetNode) {
      // console.log(`- target: ${this.target} not found`)
      return
    }
    // console.log(`- target: ${targetNode.path} found name as ${this.target}`)
    this.findAndMarkAsFamily(targetNode.path, 'parents')
    this.findAndMarkAsFamily(targetNode.path, 'children')
    targetNode.family = 'target'
  }

  setNodes () {
    this.setNodesAs(this.graphData, node => {
      return new DeepNestedGraphNode(node, this.reverse)
    })
  }

  // childNode = target (to split)
  splitNode (parentNode, childNode) {
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

  isLeaf (node) {
    // simple leaf definition: node that does not have child is leaf.
    return node.childNodePaths().length < 1
  }

  overDepth (layerOrder) {
    return (layerOrder + 2) >= this.requestedDepth * 2
  }

  assumeAsLeaf (node, layerOrder) {
    // Layer depth selection for deep nested graph.
    // If depth of the node (layerOrder) is lager than requested depth,
    // the node is assumes as leaf node (ignore subtree).
    if (node.family) {
      return this.isLeaf(node)
    }
    return this.overDepth(layerOrder) || this.isLeaf(node)
  }

  childNodePathsToCalcPosition (node) {
    return node.childNodePaths()
  }

  childNodeFrom (parentNode, childNodePath) {
    const childNode = this.findNodeByPath(childNodePath)
    if (!childNode) {
      console.error(`child ${childNodePath} not found in ${parentNode.path}`)
    }
    // split multi-parents child node to single parent node
    return this.splitNode(parentNode, childNode)
  }

  widthByChildNodes (node, childrenWHList) {
    return this.nodeXPad * 2 +
      childrenWHList.reduce((sum, d) => { return sum + d.width }, 0) +
      this.nodeXPad * (node.childNodePaths().length - 1)
  }
}
