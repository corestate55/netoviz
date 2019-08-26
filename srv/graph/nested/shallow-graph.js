import NestedGraphConstants from './constants'
import GridOperator from './grid-operator'
import ShallowNestedGraphNode from './shallow-node'
import NestedGraphLink from './link'

export default class ShallowNestedGraph extends NestedGraphConstants {
  constructor (graphData, layoutData, reverse) {
    super()
    this.graphData = graphData
    this.layoutData = layoutData
    this.reverse = reverse
    // to debug recursive operation
    this.debugCalc = false
  }

  initialize () {
    this.setGrid()
    this.setNodes()
    this.setLinks()
    this.setRootNodes()
    this.beforeCalcRootNodePosition()
    this.calcRootNodePosition()
  }

  beforeCalcRootNodePosition () {
    // To be override
  }

  setGrid () {
    this.grid = new GridOperator(this.reverse, this.layoutData)
  }

  setNodes () {
    this.setNodesAs(this.graphData, node => {
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

  findLinkBetween (sourcePath, targetPath) {
    return this.links.find(d => {
      return d.sourcePath === sourcePath && d.targetPath === targetPath
    })
  }

  setLinks () {
    this.links = []
    for (const layer of this.graphData) {
      for (const link of layer.links) {
        const reverseLink = this.findLinkBetween(
          link.targetPath,
          link.sourcePath
        )
        // filter (discard) reverse link of bi-directional link for visualizer
        if (!reverseLink) {
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

  mapPathsToNodes (paths) {
    return paths.map(path => this.findNodeByPath(path))
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

  isLeaf (node) {
    // For shallow graph:
    // Only counted as child node when it has single parent.
    // Because if it has multiple parents, it breaks tree structure.
    return this.singleParentChildNodePaths(node).length < 1
  }

  assumeAsLeaf (node, layerOrder) {
    return this.isLeaf(node)
  }

  _consoleDebug (order, pos, message, value) {
    if (!this.debugCalc) {
      return
    }
    if (typeof value === 'undefined') {
      value = ''
    }
    const indent = ' '.repeat(order)
    console.log(`[${order}]${indent} * [${pos}] ${message}`, value)
  }

  calcNodePosition (node, basePosition, layerOrder) {
    this._consoleDebug(
      layerOrder,
      'nodePos',
      `node=${node.path}, family?=${node.family}`
    )

    // node rectangle : layerOrder     (0, 2, 4, ...)
    // node tp circle : layerOrder + 1 (1, 3, 5, ...)
    this.calcTpPosition(node, basePosition, layerOrder + 1)
    // calc node Width/Height when the node is leaf.
    if (this.assumeAsLeaf(node, layerOrder)) {
      const wh = this.calcLeafNodeWH(node, basePosition, layerOrder)
      this._consoleDebug(
        layerOrder,
        'nodePos',
        `node=${node.path}, lo=${layerOrder} is assumed leaf, return: `,
        wh
      )
      return wh
    }
    // recursive position calculation
    const childrenWHList = this.calcChildNodePosition(
      node,
      basePosition,
      layerOrder + 2
    )
    this._consoleDebug(
      layerOrder,
      'nodePos',
      `node=${node.path}, children WH list:`,
      childrenWHList
    )
    const wh = this.calcSubRootNodeWH(
      node,
      basePosition,
      childrenWHList,
      layerOrder
    )
    this._consoleDebug(
      layerOrder,
      'nodePos',
      `node=${node.path}, return node wh:`,
      wh
    )
    return wh
  }

  childNodePathsToCalcPosition (node, layerOrder) {
    return this.singleParentChildNodePaths(node)
  }

  childNodeFrom (parentNode, childNodePath) {
    return this.findNodeByPath(childNodePath)
  }

  calcChildNodePosition (node, basePosition, layerOrder) {
    const childrenWHList = [] // [{ width: w, height: h }]
    let nx11 = basePosition.x + this.nodeXPad
    const ny1x = basePosition.y + (this.nodeYPad + this.r) * 2

    this._consoleDebug(
      layerOrder,
      'childNodePos',
      `node=${node.path}, lo=${layerOrder}`
    )
    for (const childNodePath of this.childNodePathsToCalcPosition(
      node,
      layerOrder
    )) {
      const childNode = this.childNodeFrom(node, childNodePath)
      this._consoleDebug(
        layerOrder,
        'childNodePos',
        `childrenNodePath=${childNodePath}, family?=${childNode.family}`
      )
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
    return (
      this.nodeXPad * 2 + 2 * this.r * tpNum + this.tpInterval * (tpNum - 1)
    )
  }

  heightByTp () {
    return (this.nodeYPad + this.r) * 2
  }

  widthByChildNodes (node, childrenWHList) {
    // childrenWHList is { width:, height: } object list mapped of node.children.
    // childrenWHList.length is same as a number of children of the node.
    return (
      this.nodeXPad * 2 +
      childrenWHList.reduce((sum, d) => {
        return sum + d.width
      }, 0) +
      this.nodeXPad * (childrenWHList.length - 1)
    )
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
    for (const tp of this.mapPathsToNodes(node.parentTpPaths())) {
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
          path: `${tp.layer()},${childTp.layer()}__${name}`,
          type: 'support-tp',
          sourcePath: tp.path,
          targetPath: childTpPath,
          diffState: childTp.diffState || {}
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
