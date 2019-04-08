import ShallowNestedGraph from './shallow-graph'
import DeepNestedGraphNode from './deep-node'

export default class DeepNestedGraph extends ShallowNestedGraph {
  setNodes (graphData) {
    this.setNodesAs(graphData, node => {
      return new DeepNestedGraphNode(node, this.reverse)
    })
  }

  selectLayout (layoutData) {
    const data = layoutData.deep
    return this.reverse ? data.reverse : data.standard
  }

  splitChildNode (parentNode, childNode) {
    // console.log(`  ** child: ${childNode.path} has ${childNode.numberOfParentNodes()} parent nodes : `, childNode.parents)
    if (parentNode.split <= 0 && childNode.numberOfParentNodes() <= 1) {
      return childNode
    }
    // console.log('  ** child has multi-parents -> split')
    const splitChildNode = childNode.splitByParent(parentNode.path)
    this.nodes.push(splitChildNode)
    // console.log(`  ** splitChild : `, splitChildNode)
    parentNode.renameChildPath(childNode.path, splitChildNode.path)
    // console.log(`  ** parent :`, parentNode)
    return splitChildNode
  }

  calcNodePosition (node, basePosition, layerOrder) {
    // console.log(`node path: ${node.path}`)
    this.calcTpPosition(node, basePosition, layerOrder + 1)
    // condition to finish recursive calc (node is leaf = have no children)
    if (node.childNodePaths().length < 1) {
      const lnwh = this.calcLeafNodeWH(node, basePosition, layerOrder)
      // console.log(`stop recurse, ${node.path} is leaf.`, lnwh)
      return lnwh
    }
    // goto recursive calc
    const childrenWHList = this.calcChildNodePosition(node, basePosition, layerOrder + 2)
    return this.calcSubRootNodeWH(node, basePosition, childrenWHList, layerOrder)
  }

  calcChildNodePosition (node, basePosition, layerOrder) {
    const childrenWHList = [] // [{ width: w, height: h }]
    let nx11 = basePosition.x + this.nodeXPad
    const ny1x = basePosition.y + (this.nodeYPad + this.r) * 2

    // console.log('children: ', node.childNodePaths())
    for (const childNodePath of node.childNodePaths()) {
      // console.log(`  child path: ${childNodePath}`)
      let childNode = this.findNodeByPath(childNodePath)
      if (!childNode) {
        console.error(`child ${childNodePath} not found in ${node.path}`)
      }
      // split multi-parents child node to single parent node
      childNode = this.splitChildNode(node, childNode)
      // recursive search
      const basePosition = { x: nx11, y: ny1x }
      const wh = this.calcNodePosition(childNode, basePosition, layerOrder)
      childrenWHList.push(wh)
      nx11 += wh.width + this.nodeXPad
    }
    return childrenWHList
  }

  widthByChildNodes (node, childrenWHList) {
    return this.nodeXPad * 2 +
      childrenWHList.reduce((sum, d) => { return sum + d.width }, 0) +
      this.nodeXPad * (node.childNodePaths().length - 1)
  }
}
