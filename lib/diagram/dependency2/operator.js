/**
 * @file Definition of class to visualize dependency-2 network diagram.
 */

import { drag } from 'd3-drag'
import { linkHorizontal } from 'd3-shape'
import { zoom } from 'd3-zoom'
import Dependency2DiagramBuilder from './builder'

/**
 * Dependency-2 network diagram visualizer with interactive operation.
 * @extends {Dependency2DiagramBuilder}
 */
class Dependency2DiagramOperator extends Dependency2DiagramBuilder {
  /**
   * Clear highlight.
   * @public
   */
  clearHighlight() {
    if (!this.rootSVGGroupSelection) {
      return // return if not ready svg (initial)
    }
    this.rootSVGGroupSelection.selectAll('.selected').classed('selected', false)
  }

  /**
   * Clear dependency lines.
   * @param {string} [lineClass] - Class to filter target dependency lines.
   * @public
   */
  clearDependencyLines(lineClass) {
    if (!this.rootSVGGroupSelection) {
      return // return if not ready svg (initial)
    }
    const selector = lineClass ? `.${lineClass}` : ''
    this.dependencyLineGroupSelection.selectAll(`path${selector}`).remove()
    this.rootSVGGroupSelection
      .selectAll(`circle${selector}`)
      .classed(lineClass, false)
    this.rootSVGGroupSelection
      .selectAll(`text${selector}`)
      .classed(lineClass, false)
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
   * Set class to endpoint of dependency line.
   * @param {Dependency2NodeData} nodeData - End-point.
   * @param {string} lineClass - Class-string.
   * @private
   */
  _setDependencyLineEndpoint(nodeData, lineClass) {
    this.rootSVGGroupSelection
      .select(`circle[id='${nodeData.path}']`)
      .classed(lineClass, true)
    this.rootSVGGroupSelection
      .select(`text[id='${nodeData.path}-lb']`)
      .classed(lineClass, true)
  }

  /**
   * Clear visible flag in diagram elements.
   * @param {string} originPath - Path of origin node/term-point.
   * @private
   */
  _clearDependencyLineEndpointVisibility(originPath) {
    const targetNodePath =
      this.typeOfPath(originPath) === 'tp'
        ? this.parentPathOf(originPath)
        : originPath
    const resetTermPointDetector = d =>
      d.type === 'tp' &&
      d.visible &&
      !this.matchChildPath(targetNodePath, d.path)

    for (const nodes of this.nodesInNetworks) {
      nodes.filter(resetTermPointDetector).forEach(d => (d.visible = false))
    }
  }

  /**
   * Re-calculate position of visible diagram-elements.
   * @private
   */
  _reCalculateVisibleNodePosition() {
    // clear all to avoid leaving selected/select-ready dep lines
    // which created before node position changes.
    this.clearAllHighlight()
    // position calculation
    this.refreshDiagramElements()
    this._setAllDiagramElementsHandler()
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
      .x(d => d[0] + this.pR)
      .y(d => d[1] + this.pR)
    this.dependencyLineGroupSelection
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
  _highlightDependencyLineEndpoint(lines, lineClass) {
    for (const line of lines) {
      this._setDependencyLineEndpoint(line.src, lineClass)
      this._setDependencyLineEndpoint(line.dst, lineClass)
    }
  }

  /**
   * Refresh (redraw) lines and circles for each dependency elements.
   * @param {string} originPath - Path of origin node/term-point.
   * @param {string} lineClass Class-string.
   * @private
   */
  _refreshDependencyElements(originPath, lineClass) {
    this._clearDependencyLineEndpointVisibility(originPath)
    // mark visible
    const originData = this._findNodeDataByPath(originPath)
    const linesOfParents = this._getFamilyTree(originData, 'parents')
    const linesOfChildren = this._getFamilyTree(originData, 'children')
    this._reCalculateVisibleNodePosition()
    // make line
    const lines = linesOfParents.concat(linesOfChildren)
    this._makeDependencyLines(lines, lineClass)
    this._highlightDependencyLineEndpoint(lines, lineClass)
  }

  /**
   * Get family-history tree of specified node.
   * @param {Dependency2NodeData} nodeData - Node/term-point data.
   * @param {string} relation - Family relation. ('parents'/'children')
   * @returns {Array<FamilyElementPair2>} Pairs of dependent nodes/term-points.
   * @private
   */
  _getFamilyTree(nodeData, relation) {
    const pathList = []
    nodeData.visible = true
    for (const familyPath of nodeData[relation]) {
      const familyNodeData = this._findNodeDataByPath(familyPath)
      if (familyNodeData) {
        familyNodeData.visible = true
        /**
         * @typedef {Object} FamilyElementPair2
         * @prop {Dependency2NodeData} src - Origin node/term-point data.
         * @prop {Dependency2NodeData} dst - Family of origin.
         * @prop {string} type - Type of nodes.
         */
        pathList.push({
          type: nodeData.type,
          src: nodeData,
          dst: familyNodeData
        })
        // push family and families of family.
        pathList.push(this._getFamilyTree(familyNodeData, relation))
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
  _findNodeDataByPath(path) {
    return this.allNodeDataList().find(d => d.path === path)
  }

  /**
   * Find network-type element of which network contains node/term-point of path.
   * @param path - Path of node/term-point.
   * @returns {Dependency2NodeData} Found network-type element.
   * @private
   */
  _findNetworkDataOwns(path) {
    const networkPath = this.networkPathOf(path)
    return this.allNodeDataList().find(d => d.path === networkPath)
  }

  /**
   * Event handler for nodes/term-points click.
   * @param {Dependency2NodeData} nodeData - Node/term-point data.
   * @protected
   */
  clickHandler(nodeData) {
    // console.log(`click: ${d.path}`)
    this.clearDependencyLines('')
    this._refreshDependencyElements(nodeData.path, 'selected')
  }

  /**
   * Event handler for nodes/term-points mouse-over.
   * @param {Event} event - Event info.
   * @param {Dependency2NodeData} nodeData - Node/term-point data.
   * @private
   */
  _mouseOverHandler(event, nodeData) {
    // console.log(`mouseOver: ${d.path}`)
    if (!nodeData.path) {
      return
    }
    this._refreshDependencyElements(nodeData.path, 'select-ready')
    this.tooltip.enableTooltip(event, nodeData)
  }

  /**
   * Event handler for nodes/term-points mouse-out.
   * @param {Dependency2NodeData} nodeData - Node/term-point data.
   * @private
   */
  _mouseOutHandler(nodeData) {
    // console.log(`mouseOut: ${d.path}`)
    if (!nodeData.path) {
      return
    }
    this.clearDependencyLines('select-ready')
    this.tooltip.disableTooltip(nodeData)
  }

  /**
   * Update network position with drag. (drag-event handler)
   * @param {string} path - Path of node.
   * @param {number} dy - Amount of move. (y-direction)
   * @private
   */
  _moveNetworkLayer(path, dy) {
    const networkData = this._findNetworkDataOwns(path)
    if (networkData) {
      networkData.y += dy
    }
    this._reCalculateVisibleNodePosition()
  }

  /**
   * Set drag event to diagram-elements.
   * @private
   */
  _setAllDiagramElementsHandler() {
    const dragStarted = (event, d) => {
      d.dragY = event.y
    }
    const dragged = (event, d) => {
      this._moveNetworkLayer(d.path, event.y - d.dragY)
      d.dragY = event.y
    }
    const dragEnded = (event, d) => {
      delete d.dragY
    }

    // add event handler to current svg object
    this.rootSVGGroupSelection
      .selectAll('.dep2')
      .on('click', (event, d) => this.clickHandler(d))
      .on('mouseover', (event, d) => this._mouseOverHandler(event, d))
      .on('mouseout', (event, d) => this._mouseOutHandler(d))
      .call(
        drag().on('start', dragStarted).on('drag', dragged).on('end', dragEnded)
      )
  }

  /**
   * Set initial zoom ratio.
   * @private
   */
  _setRootSVGZoom() {
    this.rootSVGSelection.call(
      zoom()
        .scaleExtent([1 / 4, 5])
        .on('zoom', event =>
          this.rootSVGGroupSelection.attr('transform', event.transform)
        )
    )
  }

  /**
   * @override
   */
  setAllDiagramElementsHandler() {
    // for initialize (only called first time)
    this._setRootSVGZoom()
    this._setAllDiagramElementsHandler()
    this.setDiagramControlButtonsHandler(() => {
      this.clearHighlight()
      this.clearDependencyLines('')
    })
  }
}

export default Dependency2DiagramOperator
