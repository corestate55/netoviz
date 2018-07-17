'use strict'

import * as d3 from 'd3'
import {Graphs} from './graphs'
import {ForceSimulator} from './force-simulator'

export class GraphVisualizer extends Graphs {
  constructor (topoData) {
    super(topoData)
  }

  drawGraphs () {
    // entrypoint: draw each layer
    this.graphs.forEach((graph) => {
      this.drawGraph(graph)
    })
  }

  makeNetworkLayer (nwName, width, height) {
    return d3.select('body')
      .select('div#visualizer')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g') // topology graph container
      .attr('id', nwName)
      .attr('class', 'network')
  }

  makeClearButton (nwLayer) {
    return nwLayer.append('g')
      .attr('class', 'clearbutton')
      .append('text')
      .attr('x', 10)
      .attr('y', 20)
      .text('[clear all selection/highlight]')
  }

  makeLinkObjects (nwLayer, links) {
    return nwLayer.append('g')
      .attr('class', 'link')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('id', (d) => { return d.path })
  }

  makeTpObjects (nwLayer, nodes) {
    return nwLayer.append('g')
      .attr('class', 'tp')
      .selectAll('circle')
      .data(nodes.filter((d) => { return d.type === 'tp' }))
      .enter()
      .append('circle')
      .attr('id', (d) => { return d.path })
  }

  makeNodeObjects (nwLayer, nodes) {
    return nwLayer.append('g')
      .attr('class', 'node')
      .selectAll('rect')
      .data(nodes.filter((d) => { return d.type === 'node' }))
      .enter()
      .append('rect')
      .attr('id', (d) => { return d.path })
  }

  makeLabelObjects (nwLayer, nodes) {
    return nwLayer.append('g')
      .attr('class', 'labels')
      .selectAll('text')
      .data(nodes)
      .enter()
      .append('text')
      .attr('class', 'label')
      .text((d) => { return d.name })
  }

  drawGraph (graph) {
    var graphSize = graph.nodes.length
    // small
    var width = 400
    var height = 400
    if (graphSize > 50) {
      // large
      width = 2000
      height = 1000
    } else if (graphSize >= 20 && graphSize < 50) {
      // medium
      width = 800
      height = 800
    }
    graph.links.forEach((d) => { // key alias
      d.source = d.sourceId
      d.target = d.targetId
    })

    // clear all highlighted object
    function clearHighlight () {
      var element = document.getElementById('visualizer');
      ['selectedchildren', 'selectedparents', 'selected'].forEach((d) => {
        var selectedElements = element.getElementsByClassName(d)
        Array.from(selectedElements).forEach((element) => {
          element.classList.remove(d)
        })
      })
    }

    // highlight selected node
    function highlightNodeByPath (direction, path) {
      var element = document.getElementById(path)
      if (direction === 'children') {
        element.classList.add('selectedchildren')
      } else if (direction === 'parents') {
        element.classList.add('selectedparents')
      } else {
        ['selectedchildren', 'selectedparents'].forEach((d) => {
          element.classList.remove(d)
        })
        element.classList.add('selected')
      }
    }

    var self = this // alias to use event callback closure
    // event callback
    // find nodes to highlight via through all layers
    function highlightNode (d) {
      function findSupportingObj (direction, path) {
        // highlight DOM
        console.log('....', direction, path)
        highlightNodeByPath(direction, path)
        // recursive search
        var node = self.findNodeByPath(path)
        if (node[direction]) {
          node[direction].forEach((d) => {
            findSupportingObj(direction, d)
          })
        }
      }
      // highlight selected object and its children/parents
      var path = d.getAttribute('id')
      console.log('highlight_top: ', path)
      findSupportingObj('children', path)
      findSupportingObj('parents', path)
      findSupportingObj('clicked', path) // dummy direction
    }

    var nwLayer = this.makeNetworkLayer(graph.name, width, height)
    var clearBtn = this.makeClearButton(nwLayer)
    var link = this.makeLinkObjects(nwLayer, graph.links)
    var tp = this.makeTpObjects(nwLayer, graph.nodes)
    var node = this.makeNodeObjects(nwLayer, graph.nodes)
    var label = this.makeLabelObjects(nwLayer, graph.nodes)

    var simulator = new ForceSimulator({
      'height': height,
      'width': width,
      'graph': graph,
      'link': link,
      'tp': tp,
      'node': node,
      'label': label})

    // set event callback for tp/node
    setEventCallBack(tp)
    setEventCallBack(node)

    function setEventCallBack (obj) {
      // use `function() {}` NOT arrow-function `() => {}`.
      // arrow-function bind `this` according to decrared position
      obj
        .on('click', function () { highlightNode(this) })
        .on('mouseover', function () { mouseOver(this) })
        .on('mouseout', function () { mouseOut(this) })
        .call(d3.drag()
          .on('start', simulator.dragstarted)
          .on('drag', simulator.dragged)
          .on('end', simulator.dragended))
    }

    // set event callback for clear button
    clearBtn
      .on('click', clearHighlight)
      .on('mouseover', function () { mouseOver(this) }) // NOTICE: `this`
      .on('mouseout', function () { mouseOut(this) })

    function mouseOver (element) {
      element.classList.add('selectready')
    }

    function mouseOut (element) {
      element.classList.remove('selectready')
    }
  }
}
