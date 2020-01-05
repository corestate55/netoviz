import { select, selectAll } from 'd3-selection'
import TooltipCreator from './tooltip-creator'
import BaseContainer from '~/server/graph/common/base'
import DiffState from '~/server/graph/common/diff-state'

export default class SingleVisualizerBase extends BaseContainer {
  makeVisContainer() {
    // add div to keep compatibility with topology visualizer
    return select('body')
      .select('div#visualizer')
      .append('div')
      .attr('class', 'network-layer')
  }

  makeGraphSVG(svgId, svgClass, svgGroupId) {
    const origin = this.makeVisContainer()
    // Keep tooltip before at svg.
    // In topology viewer,
    // add inline-block div container (info-table) after svg.
    this.tooltip = this.makeTooltip(origin)
    this.svg = origin
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('id', svgId)
      .attr('class', svgClass)
    this.svgGrp = this.svg.append('g').attr('id', svgGroupId)
  }

  resizeSVG(width, height) {
    this.width = width
    this.height = height
    this.svg.attr('width', width).attr('height', height)
  }

  _isAggregated(node) {
    return (
      node && // check each: `node` itself will be null/undefined
      node.attribute &&
      node.attribute.class === 'AggregateNodeAttribute'
    )
  }

  _classOfDiffState(obj) {
    if ('diffState' in obj) {
      const diffState = new DiffState(obj.diffState)
      return diffState.detect()
    }
    console.warn(`object ${obj.type}: ${obj.path} does not have diffState`)
    return ''
  }

  _classOfInactive(diffState) {
    // `currentInactive` is diff state to be inactive (toggled).
    return diffState === this.currentInactive ? 'inactive' : ''
  }

  _classOfAggregated(obj) {
    return this._isAggregated(obj) ? 'aggregated' : ''
  }

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

  clearCanvas() {
    // clear graphs
    select('div#visualizer') // clear all graphs
      .selectAll('div.network-layer')
      .remove()
  }

  clearTooltip(originSelection) {
    originSelection.select('div.tooltip').remove()
  }

  makeTooltip(originSelection) {
    this.clearTooltip(originSelection)
    return new TooltipCreator(originSelection)
  }

  makeClearHighlightButton() {
    const clearButtonFontSize = 12
    this.svg
      .append('text')
      .attr('id', 'clear-button')
      .attr('class', 'control-button')
      .attr('x', clearButtonFontSize / 2)
      .attr('y', clearButtonFontSize)
      .text('[Clear Highlight]')
  }

  makeToggleDiffButton() {
    const clearButtonFontSize = 12
    this.svg
      .append('text')
      .attr('id', 'diff-toggle-button')
      .attr('class', 'control-button')
      .attr('x', clearButtonFontSize / 2)
      .attr('y', clearButtonFontSize * 2.2)
      .text('[Toggle Diff Added/Deleted]')
  }

  makeGraphControlButtons() {
    this.makeClearHighlightButton()
    this.makeToggleDiffButton()
  }

  controlButtonMouseOverCallback(selector) {
    return () => this.svg.select(selector).classed('select-ready', true)
  }

  controlButtonMouseOutCallback(selector) {
    return () => this.svg.select(selector).classed('select-ready', false)
  }

  setClearHighlightButtonHandler(clickCallback) {
    const selector = 'text#clear-button'
    this.svg
      .select(selector)
      .on('click', clickCallback)
      .on('mouseover', this.controlButtonMouseOverCallback(selector))
      .on('mouseout', this.controlButtonMouseOutCallback(selector))
  }

  toggleActiveDiff() {
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

  setToggleDiffButtonHandler() {
    const selector = 'text#diff-toggle-button'
    this.svg
      .select(selector)
      .on('click', this.toggleActiveDiff)
      .on('mouseover', this.controlButtonMouseOverCallback(selector))
      .on('mouseout', this.controlButtonMouseOutCallback(selector))
  }

  setGraphControlButtons(clearHighlightClickCB) {
    this.setClearHighlightButtonHandler(clearHighlightClickCB)
    this.setToggleDiffButtonHandler()
  }

  clearWarningMessage() {
    this.svg.selectAll('text.warning').remove()
  }

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

  childPathRegexp(path) {
    return new RegExp(`${path}__.*`)
  }

  matchChildPath(parentPath, targetPath) {
    return targetPath.match(this.childPathRegexp(parentPath))
  }

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

  networkPathOf(path) {
    return path.split('__').shift() // head of path string
  }

  parentPathOf(path) {
    const paths = path.split('__')
    paths.pop() // remove latest path
    return paths.join('__')
  }

  targetNameFromAlert(alert) {
    return (alert && alert.host) || ''
  }

  apiURI(graphName, jsonName, params) {
    const paramStrings = []
    for (const [key, value] of Object.entries(params)) {
      if (!value) {
        continue
      }
      paramStrings.push(`${key}=${encodeURIComponent(value)}`)
    }
    const baseUri = `/api/graph/${graphName}/${jsonName}`
    const uri = [baseUri, paramStrings.join('&')].join('?')
    console.log('Query URI :', uri)
    return uri
  }
}
