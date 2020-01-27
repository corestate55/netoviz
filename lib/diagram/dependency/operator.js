/**
 * @file Definition of class to visualize dependency network diagram.
 */
/**
 * Both node and term-point data. (like {@link ForceSimulationNodeData})
 * @typedef {
 *   DependencyNodeData|DependencyTermPointData
 * } DependencyElementData
 */

import { event } from 'd3-selection'
import { linkVertical } from 'd3-shape'
import { zoom } from 'd3-zoom'
import DependencyDiagramBuilder from './builder'

/**
 * Dependency network diagram with interactive operations.
 * @extends {DependencyDiagramBuilder}
 */
class DependencyDiagramOperator extends DependencyDiagramBuilder {
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
    const selector = lineClass ? `path.${lineClass}` : 'path'
    this.dependencyLinesGroupSelection.selectAll(selector).remove()
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
   * Convert `FamilyElementPair` to `DependencyLineData`.
   * @param {FamilyElementPair} line - A pair of nodes/term-points.
   * @returns {DependencyLineData} Data of dependency line.
   * @private
   */
  _lineConverter(line) {
    /**
     * Data of dependency-line for line generator.
     * @typedef {Object} DependencyLineData
     * @prop {Array<number>} source - [x,y] of source element position.
     * @prop {Array<number>} target - [x,y] of destination element position.
     * @prop {string} type - Type of line.
     */
    if (line.src.type === 'tp') {
      return {
        source: [line.src.cx, line.src.cy],
        target: [line.dst.cx, line.dst.cy],
        type: 'tp'
      }
    }
    // else line.src.type === 'node'
    const srcNodeY = line => {
      return line.src.y < line.dst.y ? line.src.y + line.src.height : line.src.y
    }
    const dstNodeY = line => {
      return line.src.y < line.dst.y ? line.dst.y : line.dst.y + line.dst.height
    }
    return {
      source: [line.src.x + line.src.width / 2, srcNodeY(line)],
      target: [line.dst.x + line.dst.width / 2, dstNodeY(line)],
      type: 'node'
    }
  }

  /**
   * Make dependency lines. (callback for dependency line data)
   * @param {Array<FamilyElementPair>} lines - List of src/dst node/term-point pairs.
   * @param {string} lineClass - Class string to set dependency line.
   * @private
   */
  _makeDependencyLines(lines, lineClass) {
    const lineGenerator = linkVertical()
      .x(d => d[0])
      .y(d => d[1])
    this.dependencyLinesGroupSelection
      .selectAll(`path.${lineClass}`)
      .data(
        lines
          .filter(line => line.src.type === line.dst.type)
          .map(line => this._lineConverter(line))
      )
      .enter()
      .append('path')
      .attr('class', d => `dep ${d.type} ${lineClass}`)
      .attr('d', lineGenerator)
      .attr('stroke-width', 5)
  }

  /**
   * Convert list of `FamilyElementPair` to its paths list.
   * @param {DependencyElementData} elementData - Origin node/term-point data.
   * @param {Array<FamilyElementPair>} pairs - List of family element pair.
   * @returns {Array<string>} Paths list of families of origin.
   * @private
   */
  _pathsFromPairs(elementData, pairs) {
    // without sort-uniq,
    // parents/children tree contains duplicated element.
    // when toggle odd times the element, highlight was disabled.
    return this.sortUniq(
      this.flatten([
        elementData.path,
        pairs.map(d => d.src.path),
        pairs.map(d => d.dst.path)
      ])
    )
  }

  /**
   * Run (exec) action for all family (parents and children) of a node/term-point.
   * @param {DependencyElementData} elementData - Target node/term-point.
   * @param {DependencyDiagramOperator-dependencyLineCallback} dependencyLineCallback - Callback
   *     to run with dependency-lines of target.
   * @param {DependencyDiagramOperator-familyCallback} familyCallback - Callback
   *     to run with families (nodes/term-points) of target.
   * @private
   */
  _runParentsAndChildren(elementData, dependencyLineCallback, familyCallback) {
    const parentPairs = this._getFamilyTree(elementData, 'parents')
    const parentPaths = this._pathsFromPairs(elementData, parentPairs)
    const childPairs = this._getFamilyTree(elementData, 'children')
    const childPaths = this._pathsFromPairs(elementData, childPairs)

    /**
     * Action for each pairs(line: src/dst)
     * @callback DependencyDiagramOperator-dependencyLineCallback
     * @param {Array<FamilyElementPair>} pairs -List of pairs of dependants of target node.
     */
    dependencyLineCallback(parentPairs.concat(childPairs))
    /**
     * Action for each parent/child.
     * @callback DependencyDiagramOperator-familyCallback
     * @param {Array<string>} paths - Paths of family.
     */
    familyCallback(this.flatten([elementData.path, parentPaths, childPaths]))
  }

  /**
   * Mark (add/remove class) to svg elements for elements with paths.
   * @param {Array<string>} paths - Paths.
   * @param {Array<string|boolean>} markClass - A pair of class-string and enable/disable (true/false).
   * @private
   */
  _markTargetByPaths(paths, markClass) {
    paths.forEach(path => {
      this.rootSVGGroupSelection.select(`[id='${path}']`).classed(...markClass)
    })
  }

  /**
   * Event handler for nodes/term-points click.
   * @param {DependencyElementData} elementData - Node/term-point data.
   * @protected
   */
  clickHandler(elementData) {
    // console.log('click event: ', d)
    const makeSelectDepLines = pairs => {
      this.clearDependencyLines('')
      this._makeDependencyLines(pairs, 'selected')
    }
    const setHighlightByPath = paths => {
      this.clearHighlight()
      this._markTargetByPaths(paths, ['selected', true])
    }
    this._runParentsAndChildren(
      elementData,
      makeSelectDepLines,
      setHighlightByPath
    )
  }

  /**
   * Mark (add/remove) select-ready to specified elements with path.
   * @param {string} path - Path of node/term-point.
   * @param {boolean} turnOn - True if add select-ready.
   * @private
   */
  _selectReadyByPath(path, turnOn) {
    this._markTargetByPaths([path], ['select-ready', turnOn])
  }

  /**
   * Event handler for nodes/term-points mouse-over.
   * @param {DependencyElementData} elementData - Node/term-point data.
   * @private
   */
  _mouseOverHandler(elementData) {
    // console.log(`mouseover: ${d.path}`)
    const makeSelectReadyDepLines = pairs => {
      this._makeDependencyLines(pairs, 'select-ready')
    }
    const setSelectReadyByPath = paths => {
      for (const path of paths) {
        this._selectReadyByPath(path, true)
      }
    }
    this._runParentsAndChildren(
      elementData,
      makeSelectReadyDepLines,
      setSelectReadyByPath
    )
    this.tooltip.enableTooltip(elementData)
  }

  /**
   * Event handler for nodes/term-points mouse-out.
   * @param {DependencyElementData} elementData - Node/term-point data.
   * @private
   */
  _mouseOutHandler(elementData) {
    // console.log(`mouseout: ${d.path}`)
    const clearSelectReadyDepLines = () => {
      this.clearDependencyLines('select-ready')
    }
    const unsetSelectReadyByPath = paths => {
      for (const path of paths) {
        this._selectReadyByPath(path, false)
      }
    }
    this._runParentsAndChildren(
      elementData,
      clearSelectReadyDepLines,
      unsetSelectReadyByPath
    )
    this.tooltip.disableTooltip(elementData)
  }

  /**
   * Set initial zoom ratio.
   * @private
   */
  _setRootSVGZoom() {
    const lastNodes = this.topologyData
      .map(network => network.nodes[network.nodes.length - 1])
      .filter(n => n) // ignore empty nodes case
    const maxX = Math.max(...lastNodes.map(n => n.x + n.width))
    const maxY = Math.max(
      ...lastNodes.map(n => n.y + n.height + this.fontSize * 2)
    )
    const zoomRatio = Math.min(this.width / maxX, this.height / maxY)
    this.zoom.scaleTo(this.rootSVGSelection, zoomRatio)
    this.zoom.translateTo(this.rootSVGSelection, 0, 0, [0, 0])
  }

  /**
   * Set event handlers to svg elements.
   * @param {DependencyTopologyData} topologyData - Topology data.
   * @protected
   */
  setAllDiagramElementsHandler(topologyData) {
    /** @type {DependencyTopologyData} */
    this.topologyData = topologyData
    /** @type {Selection} */
    this.rootSVGGroupSelection
      .selectAll('g.layer-objects')
      .selectAll('.dep')
      .on('click', d => this.clickHandler(d))
      .on('mouseover', d => this._mouseOverHandler(d))
      .on('mouseout', d => this._mouseOutHandler(d))

    this.setDiagramControlButtonsHandler(() => {
      this.clearHighlight()
      this.clearDependencyLines('')
    })

    /** @type {function} */
    this.zoom = zoom()
      .scaleExtent([1 / 4, 5])
      .on('zoom', () =>
        this.rootSVGGroupSelection.attr('transform', event.transform)
      )
    this.rootSVGSelection.call(this.zoom)
    this._setRootSVGZoom()
  }

  /**
   * Find node (tp/node-type node) by path.
   * @param {string} path - Path of node.
   * @returns {DependencyElementData} Found node/term-point.
   * @private
   */
  _findElementDataByPath(path) {
    let foundElementData
    for (const networkData of this.topologyData) {
      const foundNodeData = networkData.nodes.find(d => d.path === path)
      const foundTermPointData = networkData.tps.find(d => d.path === path)
      foundElementData = foundNodeData || foundTermPointData
      if (foundElementData) {
        break
      }
    }
    return foundElementData
  }

  /**
   * Get family-history tree of specified node.
   * @param {DependencyElementData} elementData - Node/term-point data.
   * @param {string} relation - Family relation. ('parents'/'children')
   * @returns {Array<FamilyElementPair>} Pairs of dependent nodes/term-points.
   * @private
   */
  _getFamilyTree(elementData, relation) {
    const paths = []
    for (const familyPath of elementData[relation]) {
      const familyElementData = this._findElementDataByPath(familyPath)
      if (!familyElementData) {
        continue
      }
      /**
       * @typedef {Object} FamilyElementPair
       * @prop {DependencyElementData} src - Origin node/term-point data.
       * @prop {DependencyElementData} dst - Family of origin.
       */
      // push myself and family
      paths.push({ src: elementData, dst: familyElementData })
      // push families of family
      paths.push(this._getFamilyTree(familyElementData, relation))
    }
    return this.flatten(paths)
  }
}

export default DependencyDiagramOperator
