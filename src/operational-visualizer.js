'use strict'

import * as d3 from 'd3'
import {ForceSimulatedVisualizer} from './simulated-visualizer'

export class OperationalVisualizer extends ForceSimulatedVisualizer {
  constructor (graph, findAllNodeFunc) {
    super(graph, findAllNodeFunc)

    // set event callback for tp/node
    this.setEventCallBack(
      [this.tp, this.node, this.nodeCircle, this.tpLabel, this.nodeLabel]
    )
    this.setClearButtonEventCallback()
  }

  setEventCallBack (objs) {
    var self = this // alias to use event callback closure

    function clearElementHighlight (element) {
      ['selectedchildren', 'selectedparents', 'selected'].forEach(
        d => element.classList.remove(d)
      )
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
          document.getElementById(path + '.tplb')
        ]
      }
      // pathObjType === 'node'
      return [
        document.getElementById(path + '.bg'),
        document.getElementById(path + '.ndlb')
      ]
    }

    // highlight selected node
    function highlightNodeByPath (direction, path) {
      highlightElementsByPath(path).forEach(element => {
        clearElementHighlight(element)
        if (direction === 'children') {
          element.classList.add('selectedchildren')
        } else if (direction === 'parents') {
          element.classList.add('selectedparents')
        } else {
          element.classList.add('selected')
        }
      })
    }

    // event callback
    function highlightNode (element) {
      function findSupportingObj (direction, path) {
        // highlight DOM
        console.log('....', direction, path)
        highlightNodeByPath(direction, path)
        // find nodes to highlight via through *all* layers
        var node = self.findGraphNodeByPath(path)
        if (node[direction]) {
          // search children/parent recursively
          node[direction].forEach(
            d => findSupportingObj(direction, d)
          )
        }
      }
      // highlight selected object and its children/parents
      var path = pathBody(element.getAttribute('id'))
      console.log('highlight_top: ', path)
      findSupportingObj('children', path)
      findSupportingObj('parents', path)
      findSupportingObj('clicked', path) // dummy direction
    }

    function mouseOver (element) {
      var path = pathBody(element.id)
      // set highlight style
      highlightElementsByPath(path).forEach(elm => {
        elm.classList.add('selectready')
        // enable tooltip
        var header = path
        var node = self.findGraphNodeByPath(path)
        if (node && Object.keys(node.attribute).length > 0) {
          header = header + node.attribute.toHtml()
        }
        self.tooltip
          .style('visibility', 'visible')
          .html(header)
      })
    }

    function mouseMove (element) {
      self.tooltip
        .style('top', d3.event.pageY - 20 + 'px')
        .style('left', (d3.event.pageX + 30) + 'px')
    }

    function mouseOut (element) {
      var path = pathBody(element.id)
      // remove highlight style
      highlightElementsByPath(path).forEach(elm => {
        elm.classList.remove('selectready')
        // disable tooltip
        self.tooltip
          .style('visibility', 'hidden')
      })
    }

    // set event callbacks
    objs.forEach(obj => {
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
    })
  }

  setClearButtonEventCallback () {
    function clearHighlight () {
      // clear all highlighted object
      var element = document.getElementById('visualizer');
      ['selectedchildren', 'selectedparents', 'selected'].forEach(d => {
        var selectedElements = element.getElementsByClassName(d)
        Array.from(selectedElements).forEach(element => {
          element.classList.remove(d)
        })
      })
    }

    // set event callback for clear button
    // NOTICE: `this`
    this.clearBtn
      .on('click', clearHighlight)
      .on('mouseover', function () {
        this.classList.add('selectready')
      })
      .on('mouseout', function () {
        this.classList.remove('selectready')
      })
  }
}
