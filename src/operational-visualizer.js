'use strict'

import * as d3 from 'd3'
import {ForceSimulatedVisualizer} from './simulated-visualizer'

export class OperationalVisualizer extends ForceSimulatedVisualizer {
  constructor (graph, findAllNodeFunc) {
    super(graph, findAllNodeFunc)

    // set event callback
    this.setZoomEvnetCallback()
    this.setGraphNodeEventCallBack()
    this.setButtonEventCallback()
  }

  setZoomEvnetCallback () {
    this.nwLayerSvg.call(d3.zoom()
      .scaleExtent([1 / 4, 5])
      .on('zoom', () => this.nwLayer.attr('transform', d3.event.transform))
    )
  }

  setGraphNodeEventCallBack () {
    const self = this // alias to use event callback closure
    const objs = [
      this.tp, this.node, this.nodeCircle, this.tpLabel, this.nodeLabel
    ]

    function clearElementHighlight (element) {
      const classList = ['selected-children', 'selected-parents', 'selected']
      for (const d of classList) {
        element.classList.remove(d)
      }
    }

    function pathObjType (path) {
      if (path.match(/.+\/.+\/.+/)) {
        return 'tp'
      }
      return 'node'
    }

    function pathBody (path) {
      // remove each id(path) suffix
      return path.replace(/\.(bg|ndlb|tplb)$/, '')
    }

    function highlightElementsByPath (path) {
      if (pathObjType(path) === 'tp') {
        return [
          document.getElementById(path),
          document.getElementById(`${path}.tplb`)
        ]
      }
      // pathObjType === 'node'
      return [
        document.getElementById(`${path}.bg`),
        document.getElementById(`${path}.ndlb`)
      ]
    }

    // highlight selected node
    function highlightNodeByPath (direction, path) {
      for (const element of highlightElementsByPath(path)) {
        clearElementHighlight(element)
        if (direction === 'children') {
          element.classList.add('selected-children')
        } else if (direction === 'parents') {
          element.classList.add('selected-parents')
        } else {
          element.classList.add('selected')
        }
      }
    }

    // event callback
    function highlightNode (element) {
      function findSupportingObj (direction, path) {
        // highlight DOM
        console.log('....', direction, path)
        highlightNodeByPath(direction, path)
        // find nodes to highlight via through *all* layers
        const node = self.findGraphNodeByPath(path)
        if (node[direction]) {
          // search children/parent recursively
          for (const d of node[direction]) {
            findSupportingObj(direction, d)
          }
        }
      }
      // highlight selected object and its children/parents
      const path = pathBody(element.getAttribute('id'))
      console.log('highlight_top: ', path)
      findSupportingObj('children', path)
      findSupportingObj('parents', path)
      findSupportingObj('clicked', path) // dummy direction
    }

    function mouseOver (element) {
      const path = pathBody(element.id)
      // set highlight style
      for (const elm of highlightElementsByPath(path)) {
        elm.classList.add('select-ready')
        // enable tooltip
        let tooltipBody = path // tooltip header
        const node = self.findGraphNodeByPath(path)
        if (node && Object.keys(node.attribute).length > 0) {
          tooltipBody = tooltipBody + node.attribute.toHtml()
        }
        self.tooltip
          .style('visibility', 'visible')
          .html(tooltipBody)
      }
    }

    function mouseMove (element) {
      self.tooltip
        .style('top', `${d3.event.pageY - 20}px`)
        .style('left', `${d3.event.pageX + 30}px`)
    }

    function mouseOut (element) {
      const path = pathBody(element.id)
      // remove highlight style
      for (const elm of highlightElementsByPath(path)) {
        elm.classList.remove('select-ready')
        // disable tooltip
        self.tooltip
          .style('visibility', 'hidden')
      }
    }

    // set event callbacks
    for (const obj of objs) {
      // use `function() {}` NOT arrow-function `() => {}`.
      // arrow-function bind `this` according to decrared position
      obj
        .on('click', function () { highlightNode(this) })
        .on('mouseover', function () { mouseOver(this) })
        .on('mousemove', function () { mouseMove(this) })
        .on('mouseout', function () { mouseOut(this) })
        .call(d3.drag()
          .on('start', self.dragstarted)
          .on('drag', self.dragged)
          .on('end', self.dragended))
    }
  }

  setButtonEventCallback () {
    // click callbacks
    // NOTICE: bind 'this': this = OperationalVisualizer
    const clearHighlight = () => {
      // clear all highlighted object
      const classList = ['selected-children', 'selected-parents', 'selected']
      for (const cls of classList) {
        d3.selectAll('div#visualizer').selectAll(`.${cls}`)
          .classed(cls, false)
      }
    }

    const toggleDiffInactive = () => {
      const visualizer = d3.selectAll('div#visualizer')
      visualizer.selectAll(`.${this.currentInactive}`)
        .classed('inactive', false)
        .transition()
        .style('fill-opacity', 1.0)
        .style('stroke-opacity', 1.0)
        .duration(500)
      this.currentInactive = this.currentInactive === 'deleted' ? 'added' : 'deleted'
      visualizer.selectAll(`.${this.currentInactive}`)
        .classed('inactive', true)
        .transition()
        .style('fill-opacity', 0.2)
        .style('stroke-opacity', 0.1)
        .duration(500)
    }

    // add class to highlight 'button' text when mouse-over/out
    // NOTICE: dont bind `this`
    function mouseOverFunc () {
      this.classList.add('select-ready')
    }
    function mouseOutFunc () {
      this.classList.remove('select-ready')
    }

    // set event callback for clear button
    this.clearBtn
      .on('click', clearHighlight)
      .on('mouseover', mouseOverFunc)
      .on('mouseout', mouseOutFunc)

    // set event callback for diff active/inactive
    this.toggleBtn
      .on('click', toggleDiffInactive)
      .on('mouseover', mouseOverFunc)
      .on('mouseout', mouseOutFunc)
  }
}
