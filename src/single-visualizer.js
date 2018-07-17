'use strict'

import * as d3 from 'd3'
import {ForceSimulator} from './force-simulator'

export class SingleGraphVisualizer {
  constructor (graph) {
    this.graph = graph
    this.setCavasSize()
  }

  setHighlightNodeCallback (func) {
    this.highlightNode = func
  }

  makeNetworkLayer () {
    return d3.select('body')
      .select('div#visualizer')
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .append('g') // topology graph container
      .attr('id', this.graph.name)
      .attr('class', 'network')
  }

  makeClearButton () {
    return this.nwLayer.append('g')
      .attr('class', 'clearbutton')
      .append('text')
      .attr('x', 10)
      .attr('y', 20)
      .text('[clear all selection/highlight]')
  }

  makeLinkObjects () {
    return this.nwLayer.append('g')
      .attr('class', 'link')
      .selectAll('line')
      .data(this.graph.links)
      .enter()
      .append('line')
      .attr('id', d => d.path)
  }

  makeTpObjects () {
    return this.nwLayer.append('g')
      .attr('class', 'tp')
      .selectAll('circle')
      .data(this.graph.nodes.filter(d => d.type === 'tp'))
      .enter()
      .append('circle')
      .attr('id', d => d.path)
  }

  makeNodeObjects () {
    return this.nwLayer.append('g')
      .attr('class', 'node')
      .selectAll('rect')
      .data(this.graph.nodes.filter(d => d.type === 'node'))
      .enter()
      .append('rect')
      .attr('id', d => d.path)
  }

  makeLabelObjects () {
    return this.nwLayer.append('g')
      .attr('class', 'labels')
      .selectAll('text')
      .data(this.graph.nodes)
      .enter()
      .append('text')
      .attr('class', 'label')
      .text(d => d.name)
  }

  setCavasSize () {
    var graphSize = this.graph.nodes.length
    // small
    this.width = 400
    this.height = 400
    if (graphSize > 50) {
      // large
      this.width = 2000
      this.height = 1000
    } else if (graphSize >= 20 && graphSize < 50) {
      // medium
      this.width = 800
      this.height = 800
    }
  }

  renameLinkKey () {
    this.graph.links.forEach((d) => {
      d.source = d.sourceId
      d.target = d.targetId
    })
  }

  draw () {
    this.renameLinkKey()

    this.nwLayer = this.makeNetworkLayer()
    this.clearBtn = this.makeClearButton()
    this.link = this.makeLinkObjects()
    this.tp = this.makeTpObjects()
    this.node = this.makeNodeObjects()
    this.label = this.makeLabelObjects()

    this.simulator = new ForceSimulator({
      'height': this.height,
      'width': this.width,
      'graph': this.graph,
      'link': this.link,
      'tp': this.tp,
      'node': this.node,
      'label': this.label
    })

    // set event callback for tp/node
    this.setEventCallBack([this.tp, this.node])
    this.setClearButtonEventCallback()
  }

  setEventCallBack (objs) {
    var self = this // alias to use event callback closure
    objs.forEach((obj) => {
      // use `function() {}` NOT arrow-function `() => {}`.
      // arrow-function bind `this` according to decrared position
      obj
        .on('click', function () { self.highlightNode(this) })
        .on('mouseover', function () { self.mouseOver(this) })
        .on('mouseout', function () { self.mouseOut(this) })
        .call(d3.drag()
          .on('start', self.simulator.dragstarted)
          .on('drag', self.simulator.dragged)
          .on('end', self.simulator.dragended))
    })
  }

  clearHighlight () {
    // clear all highlighted object
    var element = document.getElementById('visualizer');
    ['selectedchildren', 'selectedparents', 'selected'].forEach((d) => {
      var selectedElements = element.getElementsByClassName(d)
      Array.from(selectedElements).forEach((element) => {
        element.classList.remove(d)
      })
    })
  }

  mouseOver (element) {
    element.classList.add('selectready')
  }

  mouseOut (element) {
    element.classList.remove('selectready')
  }

  setClearButtonEventCallback () {
    var self = this // alias to use event callback closure
    // set event callback for clear button
    this.clearBtn
      .on('click', self.clearHighlight)
      .on('mouseover', function () { self.mouseOver(this) }) // NOTICE: `this`
      .on('mouseout', function () { self.mouseOut(this) })
  }
}
