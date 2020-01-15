/**
 * Definition of base class to visualize single network diagram.
 *
 * @typedef {NestedGraphNodeData} GraphNodeData
 * It has 2-types (tp/node) and is attached svg element.
 * TODO: Abstract graph node data
 */

import { select, selectAll } from 'd3-selection'
import TooltipCreator from './tooltip-creator'
import BaseContainer from '~/server/graph/common/base'
import DiffState from '~/server/graph/common/diff-state'

/**
 * Base of single network diagram visualizer.
 * @extends {BaseContainer}
 */
class SingleVisualizerBase extends BaseContainer {
  /**
   * Make base document structure.
   * @returns {Selection} Div container to contain SVG.
   * @protected
   */
  makeVisContainer() {
    // add div to keep compatibility with topology visualizer
    return select('body')
      .select('div#visualizer')
      .append('div')
      .attr('class', 'network-layer')
  }

  /**
   * Make SVG to visualize network diagram.
   * @param {string} svgId - `id` attribute of SVG.
   * @param {string} svgClass - `class` attribute of SVG.
   * @param {string} svgGroupId - `id` attribute of group in SVG.
   * @protected
   */
  makeGraphSVG(svgId, svgClass, svgGroupId) {
    const origin = this.makeVisContainer()
    // Keep tooltip before at svg.
    // In topology viewer,
    // add inline-block div container (info-table) after svg.
    /** @type {TooltipCreator} */
    this.tooltip = this._makeTooltipCreator(origin)
    /** @type {Selection} */
    this.svg = origin
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('id', svgId)
      .attr('class', svgClass)
    /** @type {Selection} */
    this.svgGrp = this.svg.append('g').attr('id', svgGroupId)
  }

  /**
   * Resize SVG width/height.
   * @param {number} width - Width of SVG.
   * @param {number} height - Height of SVG.
   * @public
   */
  resizeSVG(width, height) {
    this.width = width
    this.height = height
    this.svg.attr('width', width).attr('height', height)
  }

  /**
   * Check target node is aggregated node.
   * @param {GraphNodeData} node - Target node.
   * @returns {boolean} True if target node is aggregated node.
   * @protected
   */
  isAggregated(node) {
    // check each: `node` itself will be null/undefined
    return Boolean(
      node &&
        node.attribute &&
        node.attribute.class === 'AggregateNodeAttribute'
    )
  }

  /**
   * Check target node is aggregated node and it has family relation attribute.
   * @param {GraphNodeData} node - Target node.
   * @returns {boolean} True if target node is aggregated and has family.
   * @protected
   */
  isFamilyAggregated(node) {
    return Boolean(
      this.isAggregated(node) && node.family && node.family.relation
    )
  }

  /**
   * Check target node is aggregated and parents (not children).
   * @param {GraphNodeData} node - Target node.
   * @returns {boolean} True if target node is aggregated and parents.
   * @private
   */
  isParentsAggregated(node) {
    return this.isFamilyAggregated(node) && node.family.relation !== 'children'
  }

  /**
   * HTML class string with diff-state.
   * @param {GraphNodeData} obj - Target node that has diff-state.
   * @returns {string} Class string of diff-state in target.f
   * @private
   */
  _classOfDiffState(obj) {
    if ('diffState' in obj) {
      const diffState = new DiffState(obj.diffState)
      return diffState.detect()
    }
    console.warn(`object ${obj.type}: ${obj.path} does not have diffState`)
    return ''
  }

  /**
   * Check diff-state is visible (active) or not.
   * (The visualizer can toggle visibility of object according to its diff-state.)
   * @param {string} diffState - String by diff-state.
   * @returns {string} Class string for SVG element.
   * @private
   */
  _classOfInactive(diffState) {
    // `currentInactive` is diff state to be inactive (toggled).
    return diffState === this.currentInactive ? 'inactive' : ''
  }

  /**
   * HTML class string with aggregated node.
   * @param {GraphNodeData} obj - Target node.
   * @returns {string} Class string of target node.
   * @private
   */
  _classOfAggregated(obj) {
    if (this.isParentsAggregated(obj)) {
      // selected2 : target exists in children. (indirect node highlight)
      return 'aggregated selected2'
    } else if (this.isAggregated(obj)) {
      return 'aggregated'
    }
    return ''
  }

  /**
   * Class string of target node.
   * @param {GraphNodeData} obj - Target node.
   * @param {string} classString - Class string to set SVG.
   * @returns {string} Class storing including classes by node state.
   * @protected
   */
  objClassDef(obj, classString) {
    const diffState = this._classOfDiffState(obj)
    const nodeBaseClasses = [
      diffState,
      this._classOfInactive(diffState),
      this._classOfAggregated(obj)
    ]
    return classString
      .split(' ')
      .concat(nodeBaseClasses)
      .join(' ')
  }

  /**
   * Clear (remove) SVG.
   * @protected
   */
  clearCanvas() {
    // clear graphs
    select('div#visualizer') // clear all graphs
      .selectAll('div.network-layer')
      .remove()
  }

  /**
   * Clear (remove) tooltip.
   * @param {Selection} originSelection - Parent element of tooltip.
   * @private
   */
  _clearTooltip(originSelection) {
    originSelection.select('div.tooltip').remove()
  }

  /**
   * Make tooltip creator.
   * @param {Selection} originSelection - Parent element of tooltip.
   * @returns {TooltipCreator} Tooltip creator.
   * @private
   */
  _makeTooltipCreator(originSelection) {
    this._clearTooltip(originSelection)
    return new TooltipCreator(originSelection)
  }

  /**
   * Make "clear highlight" text (button) in SVG.
   * @private
   */
  _makeClearHighlightButton() {
    const clearButtonFontSize = 12
    this.svg
      .append('text')
      .attr('id', 'clear-button')
      .attr('class', 'control-button')
      .attr('x', clearButtonFontSize / 2)
      .attr('y', clearButtonFontSize)
      .text('[Clear Highlight]')
  }

  /**
   * Make "Toggle Diff ..." text 8button) in SVG.
   * @private
   */
  _makeToggleDiffButton() {
    const clearButtonFontSize = 12
    this.svg
      .append('text')
      .attr('id', 'diff-toggle-button')
      .attr('class', 'control-button')
      .attr('x', clearButtonFontSize / 2)
      .attr('y', clearButtonFontSize * 2.2)
      .text('[Toggle Diff Added/Deleted]')
  }

  /**
   * Make control texts (buttons) in SVG.
   * @public
   */
  makeGraphControlButtons() {
    this._makeClearHighlightButton()
    this._makeToggleDiffButton()
  }

  /**
   * Get mouse-over event handler. (to set `select-ready`)
   * @param {string} selector - Selector string.
   * @returns {function} Event handler function.
   * @protected
   */
  controlButtonMouseOverCallback(selector) {
    return () => this.svg.select(selector).classed('select-ready', true)
  }

  /**
   * Get mouse-out event handler. (to remove `select-ready`)
   * @param selector - Selector string.
   * @returns {function} Event handler function
   * @protected
   */
  controlButtonMouseOutCallback(selector) {
    return () => this.svg.select(selector).classed('select-ready', false)
  }

  /**
   * Set click event handler to "clear highlight" button.
   * @param {function} clickCallback - Click event handler.
   * @private
   */
  _setClearHighlightButtonHandler(clickCallback) {
    const selector = 'text#clear-button'
    this.svg
      .select(selector)
      .on('click', clickCallback)
      .on('mouseover', this.controlButtonMouseOverCallback(selector))
      .on('mouseout', this.controlButtonMouseOutCallback(selector))
  }

  /**
   * Event handler for "Toggle Diff ..." button.
   * @private
   */
  _toggleActiveDiff() {
    const visualizer = selectAll('div#visualizer')
    visualizer
      .selectAll(`.${this.currentInactive}`)
      .classed('inactive', false)
      .classed('active', true)
    this.currentInactive =
      this.currentInactive === 'deleted' ? 'added' : 'deleted'
    visualizer
      .selectAll(`.${this.currentInactive}`)
      .classed('inactive', true)
      .classed('active', false)
  }

  /**
   * Set click event handler to "Toggle Diff ..." button.
   * @private
   */
  _setToggleDiffButtonHandler() {
    const selector = 'text#diff-toggle-button'
    this.svg
      .select(selector)
      .on('click', this._toggleActiveDiff)
      .on('mouseover', this.controlButtonMouseOverCallback(selector))
      .on('mouseout', this.controlButtonMouseOutCallback(selector))
  }

  /**
   * Set click event handler to control texts (button) in SVG.
   * @param clearHighlightClickCB
   * @protected
   */
  setGraphControlButtons(clearHighlightClickCB) {
    this._setClearHighlightButtonHandler(clearHighlightClickCB)
    this._setToggleDiffButtonHandler()
  }

  /**
   * Clear (remopve) warning message in SVG.
   * @protected
   */
  clearWarningMessage() {
    this.svg.selectAll('text.warning').remove()
  }

  /**
   * make warning message in SVG.
   * @param message
   * @protected
   */
  makeWarningMessage(message) {
    this.svg
      .selectAll('text.warning')
      .data([{ message, x: 150, y: 12 }])
      .enter()
      .append('text')
      .attr('class', 'warning')
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .text(d => d.message)
  }

  /**
   * Get regexp which matches children of path.
   * @param {string} path - Node path.
   * @returns {RegExp} Regexp matches children path.
   * @private
   */
  _childPathRegexp(path) {
    return new RegExp(`${path}__.*`)
  }

  /**
   * Check target path is children path format of parent path.
   * @param {string} parentPath - Path of parent node.
   * @param {string} targetPath - path of target node.
   * @returns {boolean} True if target path is children format of parent path.
   * @protected
   */
  matchChildPath(parentPath, targetPath) {
    return Boolean(targetPath.match(this._childPathRegexp(parentPath)))
  }

  /**
   * Get type of node by path format.
   * @param {string} path - Path to check.
   * @returns {string} Type of path.
   * @protected
   */
  typeOfPath(path) {
    const length = path.split('__').length
    if (length === 3) {
      return 'tp'
    } else if (length === 2) {
      return 'node'
    } else if (length === 1) {
      return 'network'
    }
    return 'error'
  }

  /**
   * Get network name from path.
   * @param {string} path - Path.
   * @returns {string}
   * @protected
   */
  networkPathOf(path) {
    return path.split('__').shift() // head of path string
  }

  /**
   * Get parent path from path.
   * @param {string} path - Path.
   * @returns {string} Parent path.
   * @protected
   */
  parentPathOf(path) {
    const paths = path.split('__')
    paths.pop() // remove latest path
    return paths.join('__')
  }

  /**
   * Get Target name from alert.
   * @param {AlertRow} alert - Alert data.
   * @returns {string} Name of target to highlight.
   * @protected
   */
  targetNameFromAlert(alert) {
    /** @typedef {
     *     {layer: string, host: string, tp: string} |
     *     {host: string}
     *  } AlertRow
     */
    return (alert && alert.host) || ''
  }

  /**
   * Get URI string with parameter string for netoviz API server.
   * @param {string} graphName - Name of graph. (diagram type)
   * @param {string} jsonName - Name of topology file.
   * @param {Object} params - Parameter key-value dictionary.
   * @returns {string} URI string.
   */
  apiURI(graphName, jsonName, params) {
    const paramStrings = []
    for (const [key, value] of Object.entries(params)) {
      if (!value) {
        continue
      }
      paramStrings.push(`${key}=${encodeURIComponent(String(value))}`)
    }
    const baseUri = `/api/graph/${graphName}/${jsonName}`
    const uri = [baseUri, paramStrings.join('&')].join('?')
    console.log('Query URI :', uri)
    return uri
  }
}

export default SingleVisualizerBase
