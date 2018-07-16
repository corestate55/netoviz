'use strict'

import * as d3 from 'd3'
import {Networks} from './networks'
import {Graphs} from './graphs'

export class GraphVisualizer {
  constructor (topoData) {
    this.networks = new Networks(topoData)
    this.graphs = new Graphs(this.networks)
    console.log('networks: ', this.networks)
    console.log('graphs: ', this.graphs)
  }

  drawGraphs () {
    // entrypoint: draw each layer
    this.graphs.graphs.forEach((graph) => {
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
      .attr('id', function (d) { return d.path })
  }

  makeTpObjects (nwLayer, nodes) {
    return nwLayer.append('g')
      .attr('class', 'tp')
      .selectAll('circle')
      .data(nodes.filter(function (d) { return d.type === 'tp' }))
      .enter()
      .append('circle')
      .attr('id', function (d) { return d.path })
  }

  makeNodeObjects (nwLayer, nodes) {
    return nwLayer.append('g')
      .attr('class', 'node')
      .selectAll('rect')
      .data(nodes.filter(function (d) { return d.type === 'node' }))
      .enter()
      .append('rect')
      .attr('id', function (d) { return d.path })
  }

  makeLabelObjects (nwLayer, nodes) {
    return nwLayer.append('g')
      .attr('class', 'labels')
      .selectAll('text')
      .data(nodes)
      .enter()
      .append('text')
      .attr('class', 'label')
      .text(function (d) { return d.name })
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
    graph.links.forEach(function (d) { // key alias
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
        var node = self.graphs.findNodeByPath(path)
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

    function mouseOver (element) {
      element.classList.add('selectready')
    }

    function mouseOut (element) {
      element.classList.remove('selectready')
    }

    function setEventCallBack (obj) {
      obj
        .on('click', function () { highlightNode(this) })
        .on('mouseover', function () { mouseOver(this) })
        .on('mouseout', function () { mouseOut(this) })
        .call(d3.drag()
              .on('start', dragstarted)
              .on('drag', dragged)
              .on('end', dragended))
    }

    var nwLayer = this.makeNetworkLayer(graph.name, width, height)
    var clearBtn = this.makeClearButton(nwLayer)
    clearBtn
      .on('click', clearHighlight)
      .on('mouseover', function () { mouseOver(this) })
      .on('mouseout', function () { mouseOut(this) })
    var link = this.makeLinkObjects(nwLayer, graph.links)
    var tp = this.makeTpObjects(nwLayer, graph.nodes)
    var node = this.makeNodeObjects(nwLayer, graph.nodes)
    setEventCallBack(tp)
    setEventCallBack(node)
    var label = this.makeLabelObjects(nwLayer, graph.nodes)

    var simulation = d3.forceSimulation()
        .force('link',
               d3.forceLink()
               .id(function (d) { return d.id })
               .distance(linkDistance)
               .strength(linkStrength)
               .iterations(8)
              )
        .force('collide',
               d3.forceCollide()
               .radius(nodeCollideRadius)
               .strength(1.0) // collision not allowed
               .iterations(8)
              )
        .force('charge', d3.forceManyBody().strength(-50))
        .force('center', d3.forceCenter(width / 2, height / 2))

    simulation
      .nodes(graph.nodes)
      .on('tick', ticked)
      .force('link')
      .links(graph.links)

    var tpSize = 10 // tp circle radius
    var nodeSize = 40 // node width/height

    function nodeCollideRadius (d) {
      if (d.type === 'node') {
        return 1.2 * nodeSize * 3 / 4
      }
      return 1.2 * tpSize
    }

    function linkDistance (d) {
      // ?? cannot use outer scope variable
      var x = 1.2 * 30 // 1.2 * nodeSize * 3 / 4
      if (d.type === 'node-tp') {
        return x
      }
      return 2 * x
    }

    function linkStrength (d) {
      if (d.type === 'node-tp') {
        return 1.0
      }
      return 0.1
    }

    function dragstarted (d) {
      if (!d3.event.active) {
        simulation.alphaTarget(0.3).restart()
      }
      d.fx = d.x
      d.fy = d.y
    }

    function dragged (d) {
      // console.log("dragged: ", d);
      d.fx = d3.event.x
      d.fy = d3.event.y
    }

    function dragended (d) {
      // console.log("dragended: ", d);
      if (!d3.event.active) {
        simulation.alphaTarget(0)
      }
      d.fx = null
      d.fy = null
    }

    function ticked () {
      link
        .attr('x1', function (d) { return d.source.x })
        .attr('y1', function (d) { return d.source.y })
        .attr('x2', function (d) { return d.target.x })
        .attr('y2', function (d) { return d.target.y })

      tp
        .attr('r', tpSize)
        .attr('cx', function (d) { return d.x })
        .attr('cy', function (d) { return d.y })

      node
        .attr('width', nodeSize)
        .attr('height', nodeSize)
        .attr('x', function (d) { return d.x - nodeSize / 2 })
        .attr('y', function (d) { return d.y - nodeSize / 2 })
        .attr('rx', nodeSize / 8)
        .attr('ry', nodeSize / 8)

      label
        .attr('x', function (d) { return d.x })
        .attr('y', function (d) { return d.y })
    }
  }
}
