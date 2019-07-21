import { select } from 'd3-selection'
import BaseContainer from '../../../srv/graph/base'
import DiffState from '../../../srv/graph/diff-state'
import TooltipCreator from './tooltip-creator'

export default class SingleVisualizerBase extends BaseContainer {
  objClassDef (obj, classString) {
    let objState = null
    if ('diffState' in obj) {
      const diffState = new DiffState(obj.diffState)
      objState = diffState.detect()
    } else {
      console.log(`object ${obj.type}: ${obj.path} does not have diffState`)
      console.log(obj)
    }
    const list = classString.split(' ').concat(objState)
    if (objState === this.currentInactive) {
      list.push('inactive')
    }
    return list.join(' ')
  }

  clearCanvas () {
    // clear graphs
    select('div#visualizer') // clear all graphs
      .selectAll('div.network-layer')
      .remove()
  }

  clearToolTip (originSelection) {
    originSelection
      .select('div.tool-tip')
      .remove()
  }

  makeToolTip (originSelection) {
    this.clearToolTip(originSelection)
    const toolTip = originSelection
      .append('div')
      .attr('class', 'tool-tip')
    return new TooltipCreator(toolTip)
  }

  makeClearButton (originSelection) {
    const clearButtonFontSize = 12
    originSelection.append('text')
      .attr('class', 'clear-button')
      .attr('x', clearButtonFontSize / 2)
      .attr('y', clearButtonFontSize)
      .text('[clear highlight]')
  }

  makeDiffInactiveToggleButton (originSelection) {
    const clearButtonFontSize = 12
    originSelection.append('text')
      .attr('class', 'diff-toggle-button')
      .attr('x', clearButtonFontSize / 2)
      .attr('y', clearButtonFontSize * 2)
      .text('[toggle diff added/deleted]')
  }
}
