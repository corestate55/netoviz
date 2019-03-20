import { event } from 'd3-selection'
import { zoom } from 'd3-zoom'
import { drag } from 'd3-drag'
import SingleNestedGraphVisualizer from './single-visualizer'
import InterTpLinkCreator from './link-creator'

export default class OperationalNestedGraphVisualizer extends SingleNestedGraphVisualizer {
  findTargetRootNodes (i, j) {
    // -1 in arg is ignored
    return this.graphData.nodes
      .filter(node => node.type === 'node')
      .filter(node => {
        if (node.grid) { // only root node has attr:grid
          return (i >= 0 && node.grid.i === i) ||
            (j >= 0 && node.grid.j === j)
        }
        return false
      })
  }

  updateRootNodeRectPosition (rootNode) {
    this.svgGrp.select(`rect[id='${rootNode.path}']`)
      .attr('x', rootNode.x)
      .attr('y', rootNode.y)
    this.svgGrp.select(`text[id='${rootNode.path}']`) // label
      .attr('x', rootNode.x)
      .attr('y', rootNode.y)
  }

  tpsInNode (node) {
    // tp path in parents => tp node object list
    return node.parents
      .filter(parentPath => {
        return parentPath.match(/.+\/.+\/.+/)
      })
      .map(path => {
        return this.graphData.nodes.find(node => node.path === path)
      })
  }

  updateTpCirclePosition (tp) {
    this.svgGrp.select(`circle[id='${tp.path}']`)
      .attr('cx', tp.cx)
      .attr('cy', tp.cy)
    this.svgGrp.select(`text[id='${tp.path}']`) // label
      .attr('x', tp.cx)
      .attr('y', tp.cy)
  }

  childNodesOfNode (node) {
    // child path list => child node object list
    return node.children
      .map(childPath => {
        return this.graphData.nodes.find(node => node.path === childPath)
      })
  }

  moveRootNode (rootNode, dx, dy) {
    if (!rootNode) {
      return
    }

    // update node rect position
    rootNode.x += dx
    rootNode.y += dy
    this.updateRootNodeRectPosition(rootNode)

    // update tp circle position in node
    for (const tp of this.tpsInNode(rootNode)) {
      tp.cx += dx
      tp.cy += dy
      this.updateTpCirclePosition(tp)
    }

    // update child node recursively
    const childNodes = this.childNodesOfNode(rootNode)
    for (const childNode of childNodes) {
      this.moveRootNode(childNode, dx, dy)
    }
  }

  redrawLinkLines () {
    // clear link lines
    this.svgGrp.selectAll('line.support-tp').remove()
    this.svgGrp.selectAll('polyline.tp-tp').remove()
    // redraw
    const linkCreator = new InterTpLinkCreator(this.graphData)
    this.makeSupportTpLines(linkCreator.supportTpLinks())
    this.makeTpTpLines(linkCreator.tpTpLinks())
  }

  updateXGridLine (d, i) {
    this.svgGrp.select(`line#grid-x${i}`)
      .attr('x1', d.position)
      .attr('x2', d.position)
    this.svgGrp.select(`circle#grid-x${i}-handle`)
      .attr('cx', d.position)
  }

  setXGridHandler () {
    let targetRootNodes = []
    const dragStarted = (d, i) => {
      targetRootNodes = this.findTargetRootNodes(i, -1)
    }
    const dragged = (d, i) => {
      d.position = event.x
      this.updateXGridLine(d, i)
    }
    const dragEnded = (d) => {
      d.position = event.x
      for (const rootNode of targetRootNodes) {
        this.moveRootNode(rootNode, d.position - rootNode.x, 0)
      }
      this.redrawLinkLines()
    }

    this.svgGrp.selectAll('circle.grid-x-handle')
      .call(drag()
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragEnded)
      )
  }

  updatetYGridLine (d, i) {
    this.svgGrp.select(`line#grid-y${i}`)
      .attr('y1', d.position)
      .attr('y2', d.position)
    this.svgGrp.select(`circle#grid-y${i}-handle`)
      .attr('cy', d.position)
  }

  setYGridHandler () {
    let targetRootNodes = []
    const dragStarted = (d, i) => {
      targetRootNodes = this.findTargetRootNodes(-1, i)
    }
    const dragged = (d, i) => {
      d.position = event.y
      this.updatetYGridLine(d, i)
    }
    const dragEnded = (d) => {
      d.position = event.y
      for (const rootNode of targetRootNodes) {
        this.moveRootNode(rootNode, 0, d.position - rootNode.y)
      }
      this.redrawLinkLines()
    }

    this.svgGrp.selectAll('circle.grid-y-handle')
      .call(drag()
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragEnded)
      )
  }

  setSVGZoom () {
    this.svg.call(zoom()
      .scaleExtent([1 / 4, 5])
      .translateExtent([[-150, -150], [2000, 2000]])
      .on('zoom', () => this.svgGrp.attr('transform', event.transform))
    )
  }

  setOperationHandler (graphData) {
    this.graphData = graphData
    this.setXGridHandler()
    this.setYGridHandler()
    this.setSVGZoom()
  }
}
