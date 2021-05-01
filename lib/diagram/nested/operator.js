/**
 * @file Definition of interactive operations for nested network diagram.
 */

import { zoom } from 'd3-zoom'
import { drag } from 'd3-drag'
import NestedDiagramBuilder from './builder'

/**
 * Operative nested network diagram visualizer.
 * @extends {NestedDiagramBuilder}
 */
class NestedDiagramOperator extends NestedDiagramBuilder {
  /**
   * Find(-all) root node on grid [i, j].
   * @param {number} i - Ordinal number of xGrid. (<0 for multiple select)
   * @param {number} j - Ordinal number of yGrid. (<0 for multiple select)
   * @returns {Array<NestedNodeData>} Root nodes on grid.
   * @private
   */
  _findTargetRootNodes(i, j) {
    return this.topologyData.nodes.filter((node) => {
      // only root node has attr:grid
      return (
        node.grid &&
        ((i >= 0 && node.grid.i === i) || (j >= 0 && node.grid.j === j))
      )
    })
  }

  /**
   * Select node rectangles with path.
   * @param {string} [path] - Path of node. (All node rects when omitted.)
   * @returns {Selection} Node rectangles.
   * @private
   */
  _selectNodeRectByPath(path) {
    if (!path) {
      return this.rootSVGGroupSelection.selectAll('rect.node')
    }
    return this.rootSVGGroupSelection.select(`rect[id='${path}']`)
  }

  /**
   * Select node label with path.
   * @param {string} [path] - Path of node. (All node labels when omitted.)
   * @returns {Selection} Node labels.
   * @private
   */
  _selectNodeLabelByPath(path) {
    if (!path) {
      return this.rootSVGGroupSelection.selectAll('text.node')
    }
    return this.rootSVGGroupSelection.select(`text[id='${path}']`)
  }

  /**
   * Select term-point circles with path.
   * @param {string} [path] - Path of node. (All tp circles when omitted.)
   * @returns {Selection} Node labels.
   * @private
   */
  _selectTpCircleByPath(path) {
    if (!path) {
      return this.rootSVGGroupSelection.selectAll('circle.tp')
    }
    return this.rootSVGGroupSelection.select(`circle[id='${path}']`)
  }

  /**
   * Select term-point labels with path.
   * @param {string} [path] - Path of node. (All tp labels when omitted.)
   * @returns {Selection} Node labels.
   * @private
   */
  _selectTpLabelByPath(path) {
    if (!path) {
      return this.rootSVGGroupSelection.selectAll('text.tp')
    }
    return this.rootSVGGroupSelection.select(`text[id='${path}']`)
  }

  /**
   * Select inter-tp (tp-tp type) link lines by path.
   * @param {string} [path] - Path of node. (All tp-tp links when omitted.)
   * @returns {Selection} Node labels.
   * @private
   */
  _selectTpTpLineByPath(path) {
    if (!path) {
      return this.rootSVGGroupSelection.selectAll('path.tp-tp')
    }
    return this.rootSVGGroupSelection.select(`path[id='${path}']`)
  }

  /**
   * Select support-tp (support-tp type) line by path.
   * @param {string} [path] - Path of node. (All support-tp links when omitted.)
   * @returns {Selection} Node labels.
   * @private
   */
  _selectSupportTpLineByPath(path) {
    if (!path) {
      return this.rootSVGGroupSelection.selectAll('line.support-tp')
    }
    return this.rootSVGGroupSelection.select(`line[id='${path}']`)
  }

  /**
   * Select grid lines.
   * @param {string} xy - Axis. (x/y)
   * @param {number} i - Ordinal number of grid. (<0 for all grid-[xy]-lines)
   * @returns {Selection} Grid lines.
   * @private
   */
  _selectGridLine(xy, i) {
    if (i < 0) {
      return this.rootSVGGroupSelection.selectAll(`line.grid-${xy}`)
    }
    return this.rootSVGGroupSelection.select(`line#grid-${xy}${i}`)
  }

  /**
   * Select grid handle circle.
   * @param {string} xy - Axis. (x/y)
   * @param {number} i - Ordinal number of grid. (<0 for all grid-[xy]-handles)
   * @returns {Selection} Grid circles.
   * @private
   */
  _selectGridHandle(xy, i) {
    if (i < 0) {
      return this.rootSVGGroupSelection.selectAll(`circle.grid-${xy}-handle`)
    }
    return this.rootSVGGroupSelection.select(`circle#grid-${xy}${i}-handle`)
  }

  /**
   * Select grid handle label.
   * @param {string} xy - Axis. (x/y)
   * @param {number} i - Ordinal number of grid. (<0 for all grid-[xy]-labels)
   * @returns {Selection} Grid labels.
   * @private
   */
  _selectGridLabel(xy, i) {
    if (i < 0) {
      return this.rootSVGGroupSelection.selectAll(`text.grid-${xy}-label`)
    }
    return this.rootSVGGroupSelection.select(`text#grid-${xy}${i}-label`)
  }

  /**
   * Find operative node by path.
   * @param {string} path - Path of node.
   * @returns {NestedNodeData} Node.
   * @protected
   */
  findOperativeNodeByPath(path) {
    return this.topologyData.nodes.find((node) => node.path === path)
  }

  /**
   * Find inoperative node by path.
   * @param {string} path - Path of node.
   * @returns {NestedNodeData} Node.
   * @protected
   */
  findInoperativeNodeByPath(path) {
    return this.topologyData.inoperativeNodes.find((node) => node.path === path)
  }

  /**
   * Find all operative nodes by name.
   * @param {string} name - Name of node.
   * @returns {Array<NestedNodeData>} Nodes.
   * @protected
   */
  operativeNodesByName(name) {
    return this.topologyData.nodes.filter((node) => node.name === name)
  }

  /**
   * Find all inoperative nodes by name.
   * @param {string} name - Name of node.
   * @returns {Array<NestedNodeData>} Nodes.
   * @public
   */
  inoperativeNodesByName(name) {
    return this.topologyData.inoperativeNodes.filter(
      (node) => node.name === name
    )
  }

  /**
   * Update position of node rect and its label.
   * @param {NestedNodeData} rootNode - Node to update.
   * @private
   */
  _updateNodeRectPosition(rootNode) {
    this._selectNodeRectByPath(rootNode.path)
      .attr('x', rootNode.x)
      .attr('y', rootNode.y)
    this._selectNodeLabelByPath(rootNode.path) // label
      .attr('x', rootNode.x)
      .attr('y', rootNode.y + rootNode.height)
  }

  /**
   * Get term-points in (on) node.
   * @param {NestedNodeData} node - Node.
   * @returns {Array<NestedNodeData>} Term-points. (tp-type nodes)
   * @private
   */
  _tpsInNode(node) {
    // tp path in parents => tp node object list
    return node.parents
      .filter((parentPath) => this.typeOfPath(parentPath) === 'tp')
      .map((path) => this.topologyData.nodes.find((node) => node.path === path))
  }

  /**
   * Update position of tp circle and its label.
   * @param {NestedNodeData} tp - Term-point to update.
   * @private
   */
  _updateTpCirclePosition(tp) {
    this._selectTpCircleByPath(tp.path).attr('cx', tp.cx).attr('cy', tp.cy)
    this._selectTpLabelByPath(tp.path) // label
      .attr('x', tp.cx)
      .attr('y', tp.cy + tp.r)
  }

  /**
   * Get children as instance.
   * @param {NestedNodeData} node - Node.
   * @returns {Array<NestedNodeData>} Children of node.
   * @private
   */
  _childNodesOfNode(node) {
    // child path list => child node object list
    return node.children.map((childPath) => {
      return this.topologyData.nodes.find((node) => node.path === childPath)
    })
  }

  /**
   * Move root node and its children recursively.
   * @param {NestedNodeData} rootNode ^ Target root node.
   * @param {number} dx - x of amount of movement.
   * @param {number} dy - y of amount of movement.
   * @private
   */
  _moveRootNode(rootNode, dx, dy) {
    if (!rootNode) {
      return
    }

    // update node rect position
    rootNode.x += dx
    rootNode.y += dy
    this._updateNodeRectPosition(rootNode)

    // update tp circle position in node
    for (const tp of this._tpsInNode(rootNode)) {
      tp.cx += dx
      tp.cy += dy
      this._updateTpCirclePosition(tp)
    }

    // update child node recursively
    const childNodes = this._childNodesOfNode(rootNode)
    for (const childNode of childNodes) {
      this._moveRootNode(childNode, dx, dy)
    }
  }

  /**
   * Redraw link. lines (when nodes were moved.)
   * @private
   */
  _redrawLinkLines() {
    this.remakeLinkLines(this.topologyData)
    this._setLinkMouseHandler()
  }

  /**
   * Update grid (line/handle/label) position.
   * @param {GridData} d - gridData.
   * @param {string} xy - Axis. (x/y)
   * @param {number} i - Ordinal number of grid.
   * @private
   */
  _updateGridLine(d, xy, i) {
    this._selectGridLine(xy, i)
      .attr(`${xy}1`, d.position)
      .attr(`${xy}2`, d.position)
    this._selectGridHandle(xy, i).attr(`c${xy}`, d.position)
    this._selectGridLabel(xy, i).attr(xy, d.position)
  }

  /**
   * Set event handlers to Grid handler circles/labels.
   * @param {string} xy - Axis. (x/y)
   * @private
   */
  _setGridHandler(xy) {
    let targetRootNodes = []
    const dragStarted = (event, d) => {
      targetRootNodes = this._findTargetRootNodes(
        ...this.selectXY(xy, [d.index, -1], [-1, d.index])
      )
    }
    const dragged = (event, d) => {
      d.position = event[xy]
      this._updateGridLine(d, xy, d.index)
    }
    const dragEnded = (event, d) => {
      d.position = event[xy]
      for (const rootNode of targetRootNodes) {
        this._moveRootNode(
          ...this.selectXY(
            xy,
            [rootNode, d.position - rootNode.x, 0],
            [rootNode, 0, d.position - rootNode.y]
          )
        )
      }
      this._redrawLinkLines()
    }
    const gridHandles = [
      this._selectGridHandle(xy, -1),
      this._selectGridLabel(xy, -1)
    ]

    gridHandles.forEach((target) => {
      target.call(
        drag().on('start', dragStarted).on('drag', dragged).on('end', dragEnded)
      )
    })
  }

  /**
   * Set class to term-point circle.
   * @param {string} tpPath - Path of term-point.
   * @param {string} tpClass - Class to set.
   * @private
   */
  _setTpClassByPath(tpPath, tpClass) {
    this._selectTpCircleByPath(tpPath).classed(tpClass, true)
  }

  /**
   * Set class to link-line.
   * @param {InterTpLink} line - Link line.
   * @param {string} lineClass - Class to set.
   * @private
   */
  _setLineClass(line, lineClass) {
    // console.log(`link: ${d.path}.oi = ${d.overlapIndex}`)
    // tp circle
    this._setTpClassByPath(line.sourcePath, lineClass)
    this._setTpClassByPath(line.targetPath, lineClass)
    // link line
    if (line.type === 'tp-tp') {
      this._selectTpTpLineByPath(line.path).classed(lineClass, true)
    } else {
      this._selectSupportTpLineByPath(line.path).classed(lineClass, true)
    }
  }

  /**
   * Set event handlers to all (tp-tp/support-tp) link-lines.
   * @private
   */
  _setLinkMouseHandler() {
    const lineClick = (event, d) => {
      this._clearAllChecked()
      this._setLineClass(d, 'checked')
    }
    const lineMouseOver = (event, d) => {
      this._setLineClass(d, 'select-ready')
    }
    const lineMouseOut = () => {
      this._clearAllSelectReady()
    }
    const links = [
      this._selectTpTpLineByPath(),
      this._selectSupportTpLineByPath()
    ]

    links.forEach((target) => {
      target
        .on('click', lineClick)
        .on('mouseover', lineMouseOver)
        .on('mouseout', lineMouseOut)
    })
  }

  /**
   * Set initial zoom.
   * @private
   */
  _setInitialZoom() {
    const nodes = this.topologyData.nodes.filter((d) => d.type === 'node')
    const maxX = Math.max(...nodes.map((d) => d.x + d.width))
    const maxY = Math.max(...nodes.map((d) => d.y + d.height))
    const zoomRatio = Math.min(this.width / maxX, this.height / maxY)
    this.zoom.scaleTo(this.rootSVGSelection, zoomRatio)
    this.zoom.translateTo(this.rootSVGSelection, 0, 0, [0, 0])
  }

  /**
   * Set event handler of zooming to SVG.
   * @private
   */
  _setSVGZoom() {
    this.zoom = zoom().on('zoom', (event) =>
      this.rootSVGGroupSelection.attr('transform', event.transform)
    )
    this.rootSVGSelection.call(this.zoom)
    this._setInitialZoom()
  }

  /**
   * Set select-ready class to node-rect/tp-circle.
   * @param {NestedNodeData} node - Target node.
   */
  setSelectReady(node) {
    if (node.type === 'node') {
      this._selectNodeRectByPath(node.path).classed('select-ready', true)
    } else {
      this._selectTpCircleByPath(node.path).classed('select-ready', true)
    }
  }

  /**
   * Highlight node-rect/tp-circle. (for alert highlight)
   * target class = ['selected', 'selected-parents']
   * @param {NestedNodeData} node - Target node.
   * @param {string} className - Class to set.
   * @public
   */
  highlight(node, className) {
    if (node.type === 'node') {
      this._selectNodeRectByPath(node.path)
        .classed(className, true)
        .style('fill', null)
    } else {
      this._selectTpCircleByPath(node.path)
        .classed(className, true)
        .style('fill', null)
    }
  }

  /**
   * Clear (remove) `checked` class.
   * @private
   */
  _clearAllChecked() {
    this.rootSVGGroupSelection.selectAll('.checked').classed('checked', false)
  }

  /**
   * Clear (remove) `select-all` class.
   * @private
   */
  _clearAllSelectReady() {
    this.rootSVGGroupSelection
      .selectAll('.select-ready')
      .classed('select-ready', false)
  }

  /**
   * Clear (remove) all highlight class.
   * @public
   */
  clearAllAlertHighlight() {
    for (const className of ['selected', 'selected-parents', 'checked']) {
      this.rootSVGGroupSelection
        .selectAll(`.${className}`)
        .classed(className, false)
        .style('fill', (d) => (d.type === 'node' ? this.colorOfNode(d) : null))
    }
  }

  /**
   * Set event handler to term-point circles/labels.
   * @private
   */
  _setTpMouseHandler() {
    const linksHasTp = (tp) => {
      return this.topologyData.links.filter((link) => {
        return link.sourcePath === tp.path || link.targetPath === tp.path
      })
    }
    const tpCircleHighlight = (event, d, className) => {
      this.tooltip.enableTooltip(event, d)
      className === 'checked' && this._clearAllChecked()
      const links = linksHasTp(d)
      if (links.length > 0) {
        links.forEach((link) => this._setLineClass(link, className))
      } else {
        // tp without link (tp that has link-ref-count 0)
        this._setTpClassByPath(d.path, className)
      }
    }
    const tpMouseOut = () => {
      this.tooltip.disableTooltip()
      this._clearAllSelectReady()
    }
    const tps = [this._selectTpCircleByPath(), this._selectTpLabelByPath()]

    tps.forEach((target) => {
      target
        .on('click', (event, d) => tpCircleHighlight(event, d, 'checked'))
        .on('mouseover', (event, d) =>
          tpCircleHighlight(event, d, 'select-ready')
        )
        .on('mouseout', tpMouseOut)
    })
  }

  /**
   * Hook of node-click event.
   * @param {NestedNodeData} d - Clicked Node.
   * @abstract
   * @protected
   */
  nodeClickHook(d) {
    // to be overridden
  }

  /**
   * Set event handlers to Node rectangles/labels.
   * @private
   */
  _setNodeMouseHandler() {
    const nodeClick = (event, d) => {
      if (this.isAggregated(d)) {
        // disable node click (nothing to do) for aggregated node.
        return
      }
      this.clearAllAlertHighlight()
      this.operativeNodesByName(d.name).forEach((node) => {
        this.highlight(node, 'selected')
      })
      this.nodeClickHook(d)
    }
    const nodeMouseOver = (event, d) => {
      this.setSelectReady(d)
      this.tooltip.enableTooltip(event, d, nodeClick)
    }
    const nodeMouseOut = (event, d) => {
      this._clearAllSelectReady()
      this.tooltip.disableTooltip(d)
    }
    const nodes = [this._selectNodeRectByPath(), this._selectNodeLabelByPath()]

    nodes.forEach((target) => {
      target
        .on('click', nodeClick)
        .on('mouseover', nodeMouseOver)
        .on('mouseout', nodeMouseOut)
    })
  }

  /**
   * Maximum width of root node on specified grid.
   * @param {string} xy - Axis. (x/y)
   * @param {number} i - Ordinal number of grid.
   * @returns {number} Max width.
   * @private
   */
  _maxWHOnGrid(xy, i) {
    // calc width or height between Grid[i] and Grid[i+1]
    const rootNodes = this._findTargetRootNodes(
      ...this.selectXY(xy, [i, -1], [-1, i])
    )
    if (!rootNodes || rootNodes.length < 1) {
      return 0
    }
    const selectAttribute = /** @type {function} */ this.selectXY(
      xy,
      (n) => n.width,
      (n) => n.height
    )
    return Math.max(...rootNodes.map(selectAttribute))
  }

  /**
   * Fit grid interval automatically to each max width/height of root nodes on the grid.
   * @param {string} xy - Axis. (x/y)
   * @private
   */
  _gridFittingXY(xy) {
    const fitPadding = this.fontSize * 2
    const grids = this.selectXY(xy, this.xGrids, this.yGrids)
    for (let i = 0; i < grids.length - 1; i++) {
      const targetGrid = grids[i]
      const nextGrid = grids[i + 1]
      const maxWH = this._maxWHOnGrid(xy, i)
      // move grid
      nextGrid.position = targetGrid.position + maxWH + fitPadding
      this._updateGridLine(nextGrid, xy, i + 1)
      // move root node
      const nextGridRootNodes = this._findTargetRootNodes(
        ...this.selectXY(xy, [i + 1, -1], [-1, i + 1])
      )
      for (const nextGridRootNode of nextGridRootNodes) {
        this._moveRootNode(
          ...this.selectXY(
            xy,
            [nextGridRootNode, nextGrid.position - nextGridRootNode.x, 0],
            [nextGridRootNode, 0, nextGrid.position - nextGridRootNode.y]
          )
        )
      }
      // update Links
      this._redrawLinkLines()
    }
  }

  /**
   * Fit grid to root node on it.
   * @public
   */
  fitGrid() {
    this._gridFittingXY('x')
    this._gridFittingXY('y')
    this._setInitialZoom()
  }

  /**
   * Set event handlers to "Grid Fitting" text (button).
   * @private
   */
  _setGridFittingButtonHandler() {
    const selector = 'text#grid-fitting-button'
    this.rootSVGSelection
      .select(selector)
      .on('click', () => this.fitGrid())
      .on('mouseover', this.controlButtonMouseOverCallback(selector))
      .on('mouseout', this.controlButtonMouseOutCallback(selector))
  }

  /**
   * @override
   */
  setAllDiagramElementsHandler() {
    this.setDiagramControlButtonsHandler(() => this.clearAllAlertHighlight())
    this._setGridHandler('x')
    this._setGridHandler('y')
    this._setLinkMouseHandler()
    this._setTpMouseHandler()
    this._setNodeMouseHandler()
    this._setGridFittingButtonHandler()
    this._setSVGZoom()
  }
}

export default NestedDiagramOperator
