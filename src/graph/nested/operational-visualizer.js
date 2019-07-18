import { event, selectAll } from 'd3-selection'
import { zoom } from 'd3-zoom'
import { drag } from 'd3-drag'
import SingleNestedGraphVisualizer from './single-visualizer'
import InterTpLinkCreator from './link-creator'

export default class OperationalNestedGraphVisualizer extends SingleNestedGraphVisualizer {
  findTargetRootNodes (i, j) {
    return this.graphData.nodes
      .filter(node => {
        // only root node has attr:grid
        // -1 in arg(i,j) is ignored (multiple select)
        return node.grid &&
          ((i >= 0 && node.grid.i === i) || (j >= 0 && node.grid.j === j))
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

  findOperativeNodeByPath (path) {
    return this.graphData.nodes.find(node => node.path === path)
  }

  findInoperativeNodeByPath (path) {
    return this.graphData.inoperativeNodes.find(node => node.path === path)
  }

  operativeNodesByName (name) {
    return this.graphData.nodes.filter(node => node.name === name)
  }

  inoperativeNodesByName (name) {
    return this.graphData.inoperativeNodes.filter(node => node.name === name)
  }

  updateRootNodeRectPosition (rootNode) {
    this.selectNodeRectByPath(rootNode.path)
      .attr('x', this.scale(rootNode.x))
      .attr('y', this.scale(rootNode.y))
    this.selectNodeLabelByPath(rootNode.path) // label
      .attr('x', this.scale(rootNode.x))
      .attr('y', this.scale(rootNode.y + rootNode.height))
  }

  tpsInNode (node) {
    // tp path in parents => tp node object list
    return node.parents
      .filter(parentPath => {
        return parentPath.match(/.+__.+__.+/)
      })
      .map(path => {
        return this.graphData.nodes.find(node => node.path === path)
      })
  }

  updateTpCirclePosition (tp) {
    this.selectTpCircleByPath(tp.path)
      .attr('cx', this.scale(tp.cx))
      .attr('cy', this.scale(tp.cy))
    this.selectTpLabelByPath(tp.path) // label
      .attr('x', this.scale(tp.cx))
      .attr('y', this.scale(tp.cy))
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
    this.setLinkMouseHandler()
  }

  updateGridLine (d, xy, i) {
    this.selectGridLine(xy, i)
      .attr(`${xy}1`, this.scale(d.position))
      .attr(`${xy}2`, this.scale(d.position))
    this.selectGridHandle(xy, i)
      .attr(`c${xy}`, this.scale(d.position))
    this.selectGridLabel(xy, i)
      .attr(xy, this.scale(d.position))
  }

  setGridHandler (xy) {
    let targetRootNodes = []
    const dragStarted = (d, i) => {
      targetRootNodes = this.findTargetRootNodes(
        ...this.selectXY(xy, [i, -1], [-1, i])
      )
    }
    const dragged = (d, i) => {
      d.position = this.scale.invert(event[xy])
      this.updateGridLine(d, xy, i)
    }
    const dragEnded = (d) => {
      // inverse function: screen to data model scale.
      d.position = this.scale.invert(event[xy])
      for (const rootNode of targetRootNodes) {
        this.moveRootNode(
          ...this.selectXY(xy,
            [rootNode, d.position - rootNode.x, 0],
            [rootNode, 0, d.position - rootNode.y]
          ))
      }
      this.redrawLinkLines()
    }

    [this.selectGridHandle(xy, -1), this.selectGridLabel(xy, -1)]
      .forEach(target => {
        target.call(drag()
          .on('start', dragStarted)
          .on('drag', dragged)
          .on('end', dragEnded))
      })
  }

  setTpClassByPath (tpPath, tpClass) {
    this.selectTpCircleByPath(tpPath)
      .classed(tpClass, true)
  }

  setLineClass (line, lineClass) {
    // console.log(`link: ${d.path}.oi = ${d.overlapIndex}`)
    // tp circle
    this.setTpClassByPath(line.sourcePath, lineClass)
    this.setTpClassByPath(line.targetPath, lineClass)
    // link line
    if (line.type === 'tp-tp') {
      this.selectTpTpLineByPath(line.path)
        .classed(lineClass, true)
    } else {
      this.selectSupportTpLineByPath(line.path)
        .classed(lineClass, true)
    }
  }

  setLinkMouseHandler () {
    const lineClick = (d) => {
      this.clearAllChecked()
      this.setLineClass(d, 'checked')
    }
    const lineMouseOver = (d) => {
      this.setLineClass(d, 'select-ready')
    }
    const lineMouseOut = () => {
      this.clearAllSelectReady()
    }

    [this.selectTpTpLineByPath(), this.selectSupportTpLineByPath()]
      .forEach(target => {
        target
          .on('click', lineClick)
          .on('mouseover', lineMouseOver)
          .on('mouseout', lineMouseOut)
      })
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

  // for alert highlight,
  // target class = ['selected', 'selected2']
  highlight (node, className) {
    if (node.type === 'node') {
      this.selectNodeRectByPath(node.path)
        .classed(className, true)
        .style('fill', null)
    } else {
      this.selectTpCircleByPath(node.path)
        .classed(className, true)
        .style('fill', null)
    }
  }

  clearAllChecked () {
    this.svgGrp.selectAll('.checked')
      .classed('checked', false)
  }

  clearAllSelectReady () {
    this.svgGrp.selectAll('.select-ready')
      .classed('select-ready', false)
  }

  clearAllAlertHighlight () {
    for (const className of ['selected', 'selected2']) {
      this.svgGrp.selectAll(`.${className}`)
        .classed(className, false)
        .style('fill', d => this.colorOfNode(d))
    }
  }

  setTpMouseHandler () {
    const linksHasTp = (tp) => {
      return this.graphData.links.filter(link => {
        return link.sourcePath === tp.path || link.targetPath === tp.path
      })
    }
    const tpCircleHighlight = (d, className) => {
      this.tooltip.enableTooltip(d)
      className === 'checked' && this.clearAllChecked()
      const links = linksHasTp(d)
      if (links.length > 0) {
        links.forEach(link => this.setLineClass(link, className))
      } else {
        // tp without link (tp that has link-ref-count 0)
        this.setTpClassByPath(d.path, className)
      }
    }
    const tpMouseOut = () => {
      this.tooltip.disableTooltip()
      this.clearAllSelectReady()
    }

    [this.selectTpCircleByPath(), this.selectTpLabelByPath()]
      .forEach(target => {
        target
          .on('click', d => tpCircleHighlight(d, 'checked'))
          .on('mouseover', d => tpCircleHighlight(d, 'select-ready'))
          .on('mouseout', tpMouseOut)
      })
  }

  setNodeMouseHandler () {
    const nodeClick = (d) => {
      this.clearAllAlertHighlight()
      this.operativeNodesByName(d.name).forEach(node => {
        this.highlight(node, 'selected')
      })
    }
    const nodeMouseOver = (d) => {
      this.setSelectReady(d)
      this.tooltip.enableTooltip(d)
    }
    const nodeMouseOut = () => {
      this.clearAllSelectReady()
      this.tooltip.disableTooltip()
    }
    [this.selectNodeRectByPath(), this.selectNodeLabelByPath()]
      .forEach(target => {
        target
          .on('click', nodeClick)
          .on('mouseover', nodeMouseOver)
          .on('mouseout', nodeMouseOut)
      })
  }

  setClearButtonHandler () {
    const mouseOver = () => {
      this.svg.select('text#clear-button')
        .classed('select-ready', true)
    }
    const mouseOut = () => {
      this.svg.select('text#clear-button')
        .classed('select-ready', false)
    }
    this.svg.select('text#clear-button')
      .on('click', () => { this.clearAllAlertHighlight() })
      .on('mouseover', mouseOver)
      .on('mouseout', mouseOut)
  }

  toggleActiveDiff () {
    const visualizer = selectAll('div#visualizer')
    visualizer.selectAll(`.${this.currentInactive}`)
      .classed('inactive', false)
      .classed('active', true)
    this.currentInactive = this.currentInactive === 'deleted' ? 'added' : 'deleted'
    visualizer.selectAll(`.${this.currentInactive}`)
      .classed('inactive', true)
      .classed('active', false)
  }

  setToggleActiveDiffButton () {
    const mouseOver = () => {
      this.svg.select('text#diff-toggle-button')
        .classed('select-ready', true)
    }
    const mouseOut = () => {
      this.svg.select('text#diff-toggle-button')
        .classed('select-ready', false)
    }
    this.svg.select('text#diff-toggle-button')
      .on('click', this.toggleActiveDiff)
      .on('mouseover', mouseOver)
      .on('mouseout', mouseOut)
  }

  setOperationHandler (graphData) {
    this.graphData = graphData
    this.setClearButtonHandler()
    this.setToggleActiveDiffButton()
    this.setGridHandler('x')
    this.setGridHandler('y')
    this.setLinkMouseHandler()
    this.setTpMouseHandler()
    this.setNodeMouseHandler()
    this.setSVGZoom()
  }
}
