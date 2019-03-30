import { event } from 'd3-selection'
import { zoom } from 'd3-zoom'
import { drag } from 'd3-drag'
import SingleNestedGraphVisualizer from './single-visualizer'
import InterTpLinkCreator from './link-creator'

export default class OperationalNestedGraphVisualizer extends SingleNestedGraphVisualizer {
  findTargetRootNodes (i, j) {
    // -1 in arg is ignored
    return this.graphData.nodes
      .filter(node => {
        return node.grid && // only root node has attr:grid
          ((i >= 0 && node.grid.i === i) ||
            (j >= 0 && node.grid.j === j))
      })
  }

  selectNodeRectByPath (path) {
    if (!path) { // all node rect
      return this.svgGrp.selectAll('rect.node')
    }
    return this.svgGrp.select(`rect[id='${path}']`)
  }

  selectNodeLabelByPath (path) {
    if (!path) { // all node label
      return this.svgGrp.selectAll('text.node')
    }
    return this.svgGrp.select(`text[id='${path}']`)
  }

  selectTpCircleByPath (path) {
    if (!path) { // all tp circle
      return this.svgGrp.selectAll('circle.tp')
    }
    return this.svgGrp.select(`circle[id='${path}']`)
  }

  selectTpLabelByPath (path) {
    if (!path) { // all tp label
      return this.svgGrp.selectAll('text.tp')
    }
    return this.svgGrp.select(`text[id='${path}']`)
  }

  selectTpTpLineByPath (path) {
    if (!path) { // all tp-tp line
      return this.svgGrp.selectAll('polyline.tp-tp')
    }
    return this.svgGrp.select(`polyline[id='${path}']`)
  }

  selectSupportTpLineByPath (path) {
    if (!path) { // all support-tp line
      return this.svgGrp.selectAll('line.support-tp')
    }
    return this.svgGrp.select(`line[id='${path}']`)
  }

  selectGridLine (xy, i) {
    if (i < 0) { // all grid-[xy]-line
      return this.svgGrp.selectAll(`line.grid-${xy}`)
    }
    return this.svgGrp.select(`line#grid-${xy}${i}`)
  }

  selectGridHandle (xy, i) {
    if (i < 0) { // all grid-[xy]-handle circle
      return this.svgGrp.selectAll(`circle.grid-${xy}-handle`)
    }
    return this.svgGrp.select(`circle#grid-${xy}${i}-handle`)
  }

  selectGridLabel (xy, i) {
    if (i < 0) { // all grid-[xy]-label text
      return this.svgGrp.selectAll(`text.grid-${xy}-label`)
    }
    return this.svgGrp.select(`text#grid-${xy}${i}-label`)
  }

  updateRootNodeRectPosition (rootNode) {
    this.selectNodeRectByPath(rootNode.path)
      .attr('x', rootNode.x)
      .attr('y', rootNode.y)
    this.selectNodeLabelByPath(rootNode.path) // label
      .attr('x', rootNode.x)
      .attr('y', rootNode.y + rootNode.height)
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
    this.selectTpCircleByPath(tp.path)
      .attr('cx', tp.cx)
      .attr('cy', tp.cy)
    this.selectTpLabelByPath(tp.path) // label
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

  updateGridLine (d, xy, i) {
    this.selectGridLine(xy, i)
      .attr(`${xy}1`, d.position)
      .attr(`${xy}2`, d.position)
    this.selectGridHandle(xy, i)
      .attr(`c${xy}`, d.position)
    this.selectGridLabel(xy, i)
      .attr(xy, d.position)
  }

  setGridHandler (xy) {
    let targetRootNodes = []
    const selectArg = (xy, listX, listY) => {
      return xy === 'x' ? listX : listY
    }
    const dragStarted = (d, i) => {
      targetRootNodes = this.findTargetRootNodes(
        ...selectArg(xy, [i, -1], [-1, i])
      )
    }
    const dragged = (d, i) => {
      d.position = event[xy]
      this.updateGridLine(d, xy, i)
    }
    const dragEnded = (d) => {
      d.position = event[xy]
      for (const rootNode of targetRootNodes) {
        this.moveRootNode(
          ...selectArg(xy,
            [rootNode, d.position - rootNode.x, 0],
            [rootNode, 0, d.position - rootNode.y]
          ))
      }
      this.redrawLinkLines()
    }

    this.selectGridHandle(xy, -1)
      .call(drag()
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragEnded))
    this.selectGridLabel(xy, -1)
      .call(drag()
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragEnded))
  }

  clearLinkSelectHighlight () {
    this.svgGrp.selectAll('.checked')
      .classed('checked', false)
  }

  setLinkSelectHandler () {
    const checkLine = (d) => {
      // console.log(`link: ${d.path}.oi = ${d.overlapIndex}`)
      this.selectTpCircleByPath(d.sourcePath)
        .classed('checked', true)
      this.selectTpCircleByPath(d.targetPath)
        .classed('checked', true)
      if (d.type === 'tp-tp') {
        this.selectTpTpLineByPath(d.path)
          .classed('checked', true)
      } else {
        this.selectSupportTpLineByPath(d.path)
          .classed('checked', true)
      }
    }
    const clickTpCircle = (d) => {
      this.clearLinkSelectHighlight()
      this.graphData.links.filter(link => {
        return link.sourcePath === d.path || link.targetPath === d.path
      }).forEach(link => { checkLine(link) })
    }
    const clickLine = (d) => {
      this.clearLinkSelectHighlight()
      checkLine(d)
    }

    this.selectTpCircleByPath().on('click', clickTpCircle)
    this.selectTpTpLineByPath().on('click', clickLine)
    this.selectSupportTpLineByPath().on('click', clickLine)
  }

  setSVGZoom () {
    // fot to grid line size
    const zoomRatio = (this.gridEnd - this.gridStart) / Math.max(this.width, this.height)
    this.svg.call(zoom()
      .scaleExtent([1 / zoomRatio, 4])
      .translateExtent([
        [this.gridStart * 1.5, this.gridStart * 1.5],
        [this.gridEnd, this.gridEnd]
      ])
      .on('zoom', () => this.svgGrp.attr('transform', event.transform))
    )
  }

  setSelectReady (node) {
    if (node.type === 'node') {
      this.selectNodeRectByPath(node.path)
        .classed('select-ready', true)
    } else {
      this.selectTpCircleByPath(node.path)
        .classed('select-ready', true)
    }
  }

  clearSelectReady () {
    this.svgGrp.selectAll('.select-ready')
      .classed('select-ready', false)
  }

  setMouseHandler () {
    const mouseOverHandler = (d) => {
      this.setSelectReady(d)
      this.tooltip.enableTooltip(d)
    }
    const mouseOutHandler = () => {
      this.clearSelectReady()
      this.tooltip.disableTooltip()
    }
    const targets = [
      this.selectNodeRectByPath(),
      this.selectNodeLabelByPath(),
      this.selectTpCircleByPath(),
      this.selectTpLabelByPath()
    ]
    for (const target of targets) {
      target
        .on('mouseover', mouseOverHandler)
        .on('mouseout', mouseOutHandler)
    }
  }

  setOperationHandler (graphData) {
    this.graphData = graphData
    this.setGridHandler('x')
    this.setGridHandler('y')
    this.setLinkSelectHandler()
    this.setMouseHandler()
    this.setSVGZoom()
  }
}
