/**
 * @file Definition of class to visualize dependency-2 network diagram.
 */

import { drag } from 'd3-drag'
import { event } from 'd3-selection'
import { linkHorizontal } from 'd3-shape'
import { zoom } from 'd3-zoom'
import SingleDep2GraphVisualizer from './single-visualizer'

/**
 * Dependency-2 network diagram visualizer with interactive operation.
 * @extends {SingleDep2GraphVisualizer}
 */
class OperationalDep2GraphVisualizer extends SingleDep2GraphVisualizer {
  /**
   * Clear highlight.
   * @public
   */
  clearHighlight() {
    if (!this.svgGrp) {
      return // return if not ready svg (initial)
    }
    this.svgGrp.selectAll('.selected').classed('selected', false)
  }

  /**
   * Clear dependency lines.
   * @param {string} [lineClass] - Class to filter target dependency lines.
   * @public
   */
  clearDependencyLines(lineClass) {
    if (!this.svgGrp) {
      return // return if not ready svg (initial)
    }
    const selector = lineClass ? `.${lineClass}` : ''
    this.depLineSVGGrp.selectAll(`path${selector}`).remove()
    this.svgGrp.selectAll(`circle${selector}`).classed(lineClass, false)
    this.svgGrp.selectAll(`text${selector}`).classed(lineClass, false)
  }

  /**
   * Clear all highlight.
   * @public
   */
  clearAllHighlight() {
    this.clearHighlight()
    this.clearDependencyLines('')
  }

  /**
   * Set class to endpoint.
   * @param {Dependency2NodeData} endpoint - End-point of dependency line.
   * @param {string} lineClass - Class-string.
   * @private
   */
  _setDependencyLineEndPoint(endpoint, lineClass) {
    this.svgGrp.select(`circle[id='${endpoint.path}']`).classed(lineClass, true)
    this.svgGrp
      .select(`text[id='${endpoint.path}-lb']`)
      .classed(lineClass, true)
  }

  /**
   * Clear visible flag in diagram elements.
   * @param {string} originPath - Path of origin node/term-point.
   * @private
   */
  _clearDependencyLineTpVisibility(originPath) {
    const targetNodePath =
      this.typeOfPath(originPath) === 'tp'
        ? this.parentPathOf(originPath)
        : originPath
    const resetTermPointDetector = d =>
      d.type === 'tp' &&
      d.visible &&
      !this.matchChildPath(targetNodePath, d.path)

    for (const nwObjs of this.drawGraphData) {
      nwObjs.filter(resetTermPointDetector).forEach(d => (d.visible = false))
    }
  }

  /**
   * Re-calculate position of visible diagram-elements.
   * @private
   */
  _reCalculatePositionOfVisibleObject() {
    // clear all to avoid leaving selected/select-ready dep lines
    // which created before node position changes.
    this.clearAllHighlight()
    // position calculation
    this.refreshGraphObjects()
    this._setOperationHandlerToDiagramElements()
  }

  /**
   * Convert `FamilyElementPair2` to `DependencyLineData`.
   * @param {FamilyElementPair2} line - A pair of nodes/term-points.
   * @returns {DependencyLineData} Data of dependency line.
   * @private
   */
  _lineConverter(line) {
    return {
      source: [line.src.x, line.src.y],
      target: [line.dst.x, line.dst.y],
      type: line.type
    }
  }

  /**
   * Make dependency lines.
   * @param {Array<FamilyElementPair2>} lines - Pairs of dependent nodes/term-points.
   * @param {string} lineClass - Class-string.
   * @private
   */
  _makeDependencyLines(lines, lineClass) {
    const linkGenerator = linkHorizontal()
      .x(d => d[0] + this.p_r)
      .y(d => d[1] + this.p_r)
    this.depLineSVGGrp
      .selectAll(`path.dep2.${lineClass}`)
      .data(lines.map(line => this._lineConverter(line)))
      .enter()
      .append('path')
      .attr('d', linkGenerator)
      .attr('class', d => `dep2 ${lineClass} ${d.type}`)
  }

  /**
   * Highlight (set class-string) to dependency-line endpoint.
   * @param {Array<FamilyElementPair2>} lines - Pairsr of dependent nodes/term-points.
   * @param {string} lineClass - Class-string.
   * @private
   */
  _highlightDependencyLineEndPoint(lines, lineClass) {
    for (const line of lines) {
      this._setDependencyLineEndPoint(line.src, lineClass)
      this._setDependencyLineEndPoint(line.dst, lineClass)
    }
  }

  /**
   * Refresh (redraw) lines and circles for each dependency elements.
   * @param {string} originPath - Path of origin node/term-point.
   * @param {string} lineClass Class-string.
   * @private
   */
  _refreshDependencyElements(originPath, lineClass) {
    this._clearDependencyLineTpVisibility(originPath)
    // mark visible
    const originData = this._findObjByPath(originPath)
    const linesOfParents = this._getFamilyTree(originData, 'parents')
    const linesOfChildren = this._getFamilyTree(originData, 'children')
    this._reCalculatePositionOfVisibleObject()
    // make line
    const lines = linesOfParents.concat(linesOfChildren)
    this._makeDependencyLines(lines, lineClass)
    this._highlightDependencyLineEndPoint(lines, lineClass)
  }

  /**
   * Get family-history tree of specified node.
   * @param {Dependency2NodeData} objData - Node/term-point data.
   * @param {string} relation - Family relation. ('parents'/'children')
   * @returns {Array<FamilyElementPair2>} Pairs of dependent nodes/term-points.
   * @private
   */
  _getFamilyTree(objData, relation) {
    const pathList = []
    objData.visible = true
    for (const familyPath of objData[relation]) {
      const familyObjData = this._findObjByPath(familyPath)
      if (familyObjData) {
        familyObjData.visible = true
        /**
         * @typedef {Object} FamilyElementPair2
         * @prop {Dependency2NodeData} src - Origin node/term-point data.
         * @prop {Dependency2NodeData} dst - Family of origin.
         * @prop {string} type - Type of nodes.
         */
        pathList.push({
          type: objData.type,
          src: objData,
          dst: familyObjData
        })
        // push family and families of family.
        pathList.push(this._getFamilyTree(familyObjData, relation))
      }
    }
    return this.flatten(pathList)
  }

  /**
   * Find diagram element by path.
   * @param {string} path - Path of element.
   * @returns {Dependency2NodeData} Found element.
   * @private
   */
  _findObjByPath(path) {
    return this.flatDrawGraphDataList().find(d => d.path === path)
  }

  /**
   * Find network-type element of which network contains node/term-point of path.
   * @param path - Path of node/term-point.
   * @returns {Dependency2NodeData} Found network-type element.
   * @private
   */
  _findNetworkObjHas(path) {
    const nwPath = this.networkPathOf(path)
    return this.flatDrawGraphDataList().find(d => d.path === nwPath)
  }

  /**
   * Event handler for nodes/term-points click.
   * @param {Dependency2NodeData} node - Node/term-point data.
   * @protected
   */
  clickHandler(node) {
    // console.log(`click: ${d.path}`)
    this.clearDependencyLines('')
    this._refreshDependencyElements(node.path, 'selected')
  }

  /**
   * Event handler for nodes/term-points mouse-over.
   * @param {Dependency2NodeData} node - Node/term-point data.
   * @private
   */
  _mouseOverHandler(node) {
    // console.log(`mouseOver: ${d.path}`)
    if (!node.path) {
      return
    }
    this._refreshDependencyElements(node.path, 'select-ready')
    this.tooltip.enableTooltip(node)
  }

  /**
   * Event handler for nodes/term-points mouse-out.
   * @param {Dependency2NodeData} node - Node/term-point data.
   * @private
   */
  _mouseOutHandler(node) {
    // console.log(`mouseOut: ${d.path}`)
    if (!node.path) {
      return
    }
    this.clearDependencyLines('select-ready')
    this.tooltip.disableTooltip(node)
  }

  /**
   * Update network position with drag. (drag-event handler)
   * @param {string} path - Path of node.
   * @param {number} dy - Amount of move. (y-direction)
   * @private
   */
  _moveNetworkLayer(path, dy) {
    const nwObj = this._findNetworkObjHas(path)
    if (nwObj) {
      nwObj.y += dy
    }
    this._reCalculatePositionOfVisibleObject()
  }

  /**
   * Set drag event to diagram-elements.
   * @private
   */
  _setOperationHandlerToDiagramElements() {
    const dragStarted = d => {
      d.dragY = event.y
    }
    const dragged = d => {
      this._moveNetworkLayer(d.path, event.y - d.dragY)
      d.dragY = event.y
    }
    const dragEnded = d => {
      delete d.dragY
    }

    // add event handler to current svg object
    this.svgGrp
      .selectAll('.dep2')
      .on('click', d => this.clickHandler(d))
      .on('mouseover', d => this._mouseOverHandler(d))
      .on('mouseout', d => this._mouseOutHandler(d))
      .call(
        drag()
          .on('start', dragStarted)
          .on('drag', dragged)
          .on('end', dragEnded)
      )
  }

  /**
   * Set initial zoom ratio.
   * @private
   */
  _setSVGZoom() {
    this.svg.call(
      zoom()
        .scaleExtent([1 / 4, 5])
        .on('zoom', () => this.svgGrp.attr('transform', event.transform))
    )
  }

  /**
   * Set event handlers to svg elements.
   * @protected
   */
  setOperationHandler() {
    // for initialize (only called first time)
    this._setSVGZoom()
    this._setOperationHandlerToDiagramElements()
    this.setGraphControlButtons(() => {
      this.clearHighlight()
      this.clearDependencyLines('')
    })
  }
}

export default OperationalDep2GraphVisualizer
