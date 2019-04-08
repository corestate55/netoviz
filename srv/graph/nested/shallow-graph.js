import NestedGraphConstants from './constants'
import GridOperator from './grid-operator'
import ShallowNestedGraphNode from './shallow-node'
import NestedGraphLink from './link'

export default class ShallowNestedGraph extends NestedGraphConstants {
  constructor (graphData, layoutData, reverse) {
    super()
    this.reverse = reverse
    this.setGrid(layoutData)
    this.setNodes(graphData)
    this.setLinks(graphData)
    this.setRootNodes()
    this.calcRootNodePosition()
  }

  setGrid (layoutData) {
    const selectedLayoutData = this.reverse ? layoutData.reverse : layoutData.standard
    this.grid = new GridOperator(selectedLayoutData)
  }

  setNodes (graphData) {
    this.setNodesAs(graphData, node => {
      return new ShallowNestedGraphNode(node, this.reverse)
    })
  }

  setNodesAs (graphData, generateGraphNodeCallback) {
    this.nodes = []
    for (const layer of graphData) {
      for (const node of layer.nodes) {
        this.nodes.push(generateGraphNodeCallback(node))
      }
    }
  }

  setLinks (graphData) {
    this.links = []
    for (const layer of graphData) {
      for (const link of layer.links) {
        const foundReverse = this.links.find(d => {
          return d.sourceId === link.targetId && d.targetId === link.sourceId
        })
        // filter (discard) reverse link of bi-directional link for visualizer
        if (!foundReverse) {
          this.links.push(new NestedGraphLink(link))
        }
      }
    }
  }

  setRootNodes () {
    this.rootNodes = this.nodes.filter(d => d.isRootNode())
  }

  findNodeByPath (path) {
    return this.nodes.find(d => d.path === path)
  }

  calcRootNodePosition () {
    for (const rootNode of this.rootNodes) {
      const ordinalPosition = this.grid.ordinalPositionByNodePath(rootNode.path)
      // only root node has grid information
      rootNode.setGridPosition(ordinalPosition)
      const basePosition = this.grid.positionByOrdinal(ordinalPosition)
      this.calcNodePosition(rootNode, basePosition, 0)
    }
  }

  singleParentChildNodePaths (node) {
    return node.childNodePaths().filter(path => {
      const childNode = this.findNodeByPath(path)
      return childNode.numberOfParentNodes() === 1
    })
  }

  calcNodePosition (node, basePosition, layerOrder) {
    // console.log(`path: ${node.path}`)
    this.calcTpPosition(node, basePosition, layerOrder + 1)

    // if the node is leaf:
    // only counted as child node when it has single parent.
    // if it has multiple parents, it breaks tree structure.
    if (this.singleParentChildNodePaths(node).length < 1) {
      return this.calcLeafNodeWH(node, basePosition, layerOrder)
    }
    // recursive position calculation
    const childrenWHList = this.calcChildNodePosition(node, basePosition, layerOrder + 2)
    return this.calcSubRootNodeWH(node, basePosition, childrenWHList, layerOrder)
  }

  calcChildNodePosition (node, basePosition, layerOrder) {
    const childrenWHList = [] // [{ width: w, height: h }]
    let nx11 = basePosition.x + this.nodeXPad
    const ny1x = basePosition.y + (this.nodeYPad + this.r) * 2

    for (const childNodePath of this.singleParentChildNodePaths(node)) {
      // console.log(`  childrenNodePath: ${childNodePath}`)
      const childNode = this.findNodeByPath(childNodePath)
      // recursive search
      const basePosition = { x: nx11, y: ny1x }
      const wh = this.calcNodePosition(childNode, basePosition, layerOrder)
      childrenWHList.push(wh)
      nx11 += wh.width + this.nodeXPad
    }
    return childrenWHList
  }

  widthByTp (node) {
    const tpNum = node.numberOfTps()
    return this.nodeXPad * 2 + 2 * this.r * tpNum + this.tpInterval * (tpNum - 1)
  }

  heightByTp () {
    return (this.nodeYPad + this.r) * 2
  }

  widthByChildNodes (node, childrenWHList) {
    return this.nodeXPad * 2 +
      childrenWHList.reduce((sum, d) => { return sum + d.width }, 0) +
      this.nodeXPad * (this.singleParentChildNodePaths(node).length - 1)
  }

  heightByChildNodes (childrenWHList) {
    const maxChildHeight = Math.max(...childrenWHList.map(d => d.height))
    return this.heightByTp() + maxChildHeight + this.nodeYPad
  }

  calcSubRootNodeWH (node, basePosition, childrenWHList, layerOrder) {
    // width
    const widthByChildNodes = this.widthByChildNodes(node, childrenWHList)
    const widthByTp = this.widthByTp(node)
    const width = widthByChildNodes < widthByTp ? widthByTp : widthByChildNodes
    // height
    const height = this.heightByChildNodes(childrenWHList)

    node.setRect(basePosition.x, basePosition.y, width, height, layerOrder)
    return { width: width, height: height }
  }

  calcLeafNodeWH (node, basePosition, layerOrder) {
    // console.log(`  return: ${node.path} does not have child node`)
    const width = this.widthByTp(node)
    const height = this.heightByTp()

    node.setRect(basePosition.x, basePosition.y, width, height, layerOrder)
    return { width: width, height: height }
  }

  calcTpPosition (node, basePosition, layerOrder) {
    let cx11 = basePosition.x + this.nodeXPad + this.r
    const cy1x = basePosition.y + this.nodeYPad + this.r
    for (const tpPath of node.tpPathsInParents()) {
      const tp = this.findNodeByPath(tpPath)
      tp.setCircle(cx11, cy1x, this.r, layerOrder)
      cx11 += this.r * 2 + this.tpInterval
    }
  }

  operativeNodes () {
    return this.nodes.filter(node => node.operative)
  }

  inoperativeNodes () {
    return this.nodes.filter(node => !node.operative)
  }

  operativeLinksIn (operativeNodes) {
    return this.links.filter(link => link.availableIn(operativeNodes))
  }

  makeSupportTpLinks (operativeNodes) {
    const supportTpLinks = []
    for (const tp of operativeNodes.filter(d => d.isTp())) {
      // check tp path is available in operativeNodes?
      for (const childTpPath of tp.childTpPaths()) {
        const childTp = operativeNodes.find(d => d.path === childTpPath)
        if (!childTp) {
          continue
        }
        const name = `${tp.linkPath()},${childTp.linkPath()}`
        supportTpLinks.push({
          name: name,
          path: `${tp.layer()},${childTp.layer()}/${name}`,
          type: 'support-tp',
          sourcePath: tp.path,
          targetPath: childTpPath,
          sourceId: tp.id,
          targetId: childTp.id
        })
      }
    }
    return supportTpLinks
  }

  toData () {
    const operativeNodes = this.operativeNodes()
    const supportTpLinks = this.makeSupportTpLinks(operativeNodes)
    const ascendingLayerOrder = (a, b) => {
      return a.layerOrder > b.layerOrder ? 1 : -1
    }
    return {
      nodes: operativeNodes.sort(ascendingLayerOrder),
      // inoperative nodes are used to find parents
      // when hosts must be highlight by alert are not found in operative nodes.
      inoperativeNodes: this.inoperativeNodes(),
      links: this.operativeLinksIn(operativeNodes).concat(supportTpLinks),
      grid: this.grid.toData()
    }
  }
}
