/**
 * @file Definition of class to visualize dependency network diagram.
 */
/**
 * @typedef {
 *   DependencyNodeData|DependencyTermPointData
 * } DependencyElementData
 * Both node and term-point data. (like {@link ForceSimulationNodeData})
 */

import { event } from 'd3-selection'
import { linkVertical } from 'd3-shape'
import { zoom } from 'd3-zoom'
import SingleDepGraphVisualizer from './single-visualizer'

/**
 * Dependency network diagram with interactive operations.
 * @extends {SingleDepGraphVisualizer}
 */
class OperationalDepGraphVisualizer extends SingleDepGraphVisualizer {
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
    const selector = lineClass ? `path.${lineClass}` : 'path'
    this.depLineGrp.selectAll(selector).remove()
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
     * @typedef {Object} DependencyLineData
     * @prop {Array<number>} source - [x,y] of source element position.
     * @prop {Array<number>} target - [x,y] of destination element position.
     * @prop {string} type - Type of line.
     * Data of dependency-line for line generator.
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
    this.depLineGrp
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
   * @param {DependencyElementData} selfObj - Origin node/term-point data.
   * @param {Array<FamilyElementPair>} pairs - List of family element pair.
   * @returns {Array<string>} Paths list of families of origin.
   * @private
   */
  _pathsFromPairs(selfObj, pairs) {
    // without sort-uniq,
    // parents/children tree contains duplicated element.
    // when toggle odd times the element, highlight was disabled.
    return this.sortUniq(
      this.flatten([
        selfObj.path,
        pairs.map(d => d.src.path),
        pairs.map(d => d.dst.path)
      ])
    )
  }

  /**
   * Run (exec) action for all family (parents and children) of a node/term-point.
   * @param {DependencyElementData} selfObj - Target node/term-point.
   * @param {function} dependencyLineCallback - Function to run with dependency-lines of target.
   * @param {function} familyCallback - Function to run with families (nodes/term-points) of target.
   * @private
   */
  _runParentsAndChildren(selfObj, dependencyLineCallback, familyCallback) {
    const parentPairs = this._getFamilyTree(selfObj, 'parents')
    const parentPaths = this._pathsFromPairs(selfObj, parentPairs)
    const childPairs = this._getFamilyTree(selfObj, 'children')
    const childPaths = this._pathsFromPairs(selfObj, childPairs)

    // action for each pairs(line: src/dst)
    dependencyLineCallback(parentPairs.concat(childPairs))
    // action for each parent/child
    familyCallback(this.flatten([selfObj.path, parentPaths, childPaths]))
  }

  /**
   * Mark (add/remove class) to svg elements for elements with paths.
   * @param {Array<string>} paths - Paths.
   * @param {Array<string|boolean>} markClass - A pair of class-string and enable/disable (true/false).
   * @private
   */
  _markTargetByPaths(paths, markClass) {
    paths.forEach(path => {
      this.svgGrp.select(`[id='${path}']`).classed(...markClass)
    })
  }

  /**
   * Event handler for nodes/term-points click.
   * @param {DependencyElementData} element - Node/term-point data.
   * @protected
   */
  clickHandler(element) {
    // console.log('click event: ', d)
    const makeSelectDepLines = pairs => {
      this.clearDependencyLines('')
      this._makeDependencyLines(pairs, 'selected')
    }
    const setHighlightByPath = paths => {
      this.clearHighlight()
      this._markTargetByPaths(paths, ['selected', true])
    }
    this._runParentsAndChildren(element, makeSelectDepLines, setHighlightByPath)
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
   * @param {DependencyElementData} element - Node/term-point data.
   * @private
   */
  _mouseOverHandler(element) {
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
      element,
      makeSelectReadyDepLines,
      setSelectReadyByPath
    )
    this.tooltip.enableTooltip(element)
  }

  /**
   * Event handler for nodes/term-points mouse-out.
   * @param {DependencyElementData} element - Node/term-point data.
   * @private
   */
  _mouseOutHandler(element) {
    // console.log(`mouseout: ${d.path}`)
    const clearSelectReadyDepLines = pairs => {
      this.clearDependencyLines('select-ready')
    }
    const unsetSelectReadyByPath = paths => {
      for (const path of paths) {
        this._selectReadyByPath(path, false)
      }
    }
    this._runParentsAndChildren(
      element,
      clearSelectReadyDepLines,
      unsetSelectReadyByPath
    )
    this.tooltip.disableTooltip(element)
  }

  /**
   * Set initial zoom ratio.
   * @private
   */
  _setInitialZoom() {
    const lastNodes = this.graphData
      .map(layer => layer.nodes[layer.nodes.length - 1])
      .filter(n => n) // ignore empty nodes case
    const maxX = Math.max(...lastNodes.map(n => n.x + n.width))
    const maxY = Math.max(
      ...lastNodes.map(n => n.y + n.height + this.fontSize * 2)
    )
    const zoomRatio = Math.min(this.width / maxX, this.height / maxY)
    this.zoom.scaleTo(this.svg, zoomRatio)
    this.zoom.translateTo(this.svg, 0, 0, [0, 0])
  }

  /**
   * Set event handlers to svg elements.
   * @param {DependencyTopologyData} graphData - Topology data.
   * @protected
   */
  setOperationHandler(graphData) {
    /** @type {DependencyTopologyData} */
    this.graphData = graphData
    /** @type {Selection} */
    this.allTargetObj = this.svgGrp
      .selectAll('g.layer-objects')
      .selectAll('.dep')

    this.allTargetObj
      .on('click', d => this.clickHandler(d))
      .on('mouseover', d => this._mouseOverHandler(d))
      .on('mouseout', d => this._mouseOutHandler(d))

    this.setGraphControlButtons(() => {
      this.clearHighlight()
      this.clearDependencyLines('')
    })

    this.zoom = zoom()
      .scaleExtent([1 / 4, 5])
      .on('zoom', () => this.svgGrp.attr('transform', event.transform))
    this.svg.call(this.zoom)
    this._setInitialZoom()
  }

  /**
   * Find node (tp/node-type node) by path.
   * @param {string} path - Path of node.
   * @returns {DependencyElementData} Found node/term-point.
   * @private
   */
  _findGraphObjByPath(path) {
    let foundObj
    for (const layer of this.graphData) {
      const foundNode = layer.nodes.find(d => d.path === path)
      const foundTp = layer.tps.find(d => d.path === path)
      foundObj = foundNode || foundTp
      if (foundObj) {
        break
      }
    }
    return foundObj
  }

  /**
   * Get family-history tree of specified node.
   * @param {DependencyElementData} objData - Node/term-point data.
   * @param {string} relation - Family relation. ('parents'/'children')
   * @returns {Array<FamilyElementPair>} Pairs of dependent nodes/term-points.
   * @private
   */
  _getFamilyTree(objData, relation) {
    const pathList = []
    for (const familyPath of objData[relation]) {
      const familyObj = this._findGraphObjByPath(familyPath)
      if (!familyObj) {
        continue
      }
      /**
       * @typedef {Object} FamilyElementPair
       * @prop {DependencyElementData} src - Origin node/term-point data.
       * @prop {DependencyElementData} dst - Family of origin.
       */
      // push myself and family
      pathList.push({ src: objData, dst: familyObj })
      // push families of family
      pathList.push(this._getFamilyTree(familyObj, relation))
    }
    return this.flatten(pathList)
  }
}

export default OperationalDepGraphVisualizer
