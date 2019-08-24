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

  findAndMarkAsFamily (path, relationship, depth) {
    this._consoleDebug(depth, 'findAndMark', `FIND ${path} with ${relationship}`)
    const node = this.findNodeByPath(path)
    if (!node) {
      this._consoleDebug(depth, 'findAndMark', `node ${path} not found`)
      console.log(`    `)
      return
    }
    this._consoleDebug(depth, 'findAndMark', `mark ${node.path} as ${relationship}`)
    node.family = relationship
    // Find recursively: node.parents or node.children
    for (const familyPath of node[relationship]) {
      this._consoleDebug(depth, 'findAndMark', `next: ${familyPath} as ${relationship} of ${node.path}`)
      this.findAndMarkAsFamily(familyPath, relationship, depth + 1)
    }
  }

  markFamilyOfTarget () {
    const targetNode = this.nodes
      .reverse()
      .find(d => d.type === 'node' && d.name === this.target)
    if (!targetNode) {
      this._consoleDebug(0, 'markTarget', `target: ${this.target} not found`)
      return
    }
    this._consoleDebug(0, 'markTarget', `target: ${targetNode.path} found name as ${this.target}`)
    this._consoleDebug(0, 'markTarget', `find and mark as parents`)
    this.findAndMarkAsFamily(targetNode.path, 'parents', 1)
    this._consoleDebug(0, 'markTarget', `find and mark as children`)
    this.findAndMarkAsFamily(targetNode.path, 'children', 1)
    targetNode.family = 'target'
    this._consoleDebug(0, 'markTarget', `target: ${targetNode.path} mark as ${targetNode.family}`)
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
    return layerOrder >= (this.requestedDepth - 1) * 2
  }

  inTargetDepth (layerOrder) {
    return (this.requestedDepth - 1) * 2 <= layerOrder &&
      layerOrder < this.requestedDepth * 2
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

  childNodePathsToCalcPosition (node, layerOrder) {
    if (this.inTargetDepth(layerOrder) || !this.overDepth(layerOrder)) {
      return node.childNodePaths()
    }
    return node.childNodePaths().filter(nodePath => {
      const node = this.findNodeByPath(nodePath)
      // console.log(`  * child=${nodePath}, family?=${node.family}`)
      return node ? node.family : false
    })
  }

  childNodeFrom (parentNode, childNodePath) {
    const childNode = this.findNodeByPath(childNodePath)
    if (!childNode) {
      console.error(`child ${childNodePath} not found in ${parentNode.path}`)
    }
    // split multi-parents child node to single parent node
    return this.splitNode(parentNode, childNode)
  }
}
