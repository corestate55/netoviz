import ShallowNestedGraph from './shallow-graph'
import DeepNestedGraphNode from './deep-node'
import GridOperator from './grid-operator'

export default class DeepNestedGraph extends ShallowNestedGraph {
  setNodes (graphData) {
    this.setNodesAs(graphData, node => {
      return new DeepNestedGraphNode(node, this.reverse)
    })
  }

  setGrid (layoutData) {
    this.grid = new GridOperator(this.reverse, 'deep', layoutData)
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

  checkLeafNode (node) {
    return node.childNodePaths().length < 1
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
