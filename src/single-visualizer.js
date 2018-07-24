'use strict'

import * as d3 from 'd3'

export class SingleGraphVisualizer {
  constructor (graph, findAllNodeFunc) {
    this.graph = graph
    this.setCavasSize()
    // set callback to find node through all layers
    this.findGraphNodeByPath = findAllNodeFunc
    // rename link key
    this.renameLinkKey()
    // make each objects
    this.visContainer = this.makeVisContainer()
    this.nwLayer = this.makeNetworkLayer()
    this.tooltip = this.makeToolTip()
    this.clearBtn = this.makeClearButton()
    this.link = this.makeLinkObjects()
    this.nodeCircle = this.makeNodeCircleObjects()
    this.node = this.makeNodeObjects()
    this.tp = this.makeTpObjects()
    this.tpLabel = this.makeTpLabelObjects()
    this.nodeLabel = this.makeNodeLabelObjects()
  }

  makeToolTip () {
    return this.visContainer
      .append('div')
      .attr('class', 'tooltip')
  }

  makeVisContainer () {
    return d3.select('body')
      .select('div#visualizer')
      .append('div')
      .attr('class', 'networklayer')
  }

  makeNetworkLayer () {
    return this.visContainer
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
      .attr('class', 'terminalpoints')
      .selectAll('circle.tp')
      .data(this.graph.tpTypeNodes())
      .enter()
      .append('circle')
      .attr('class', 'tp')
      .attr('id', d => d.path)
  }

  makeNodeObjects () {
    return this.nwLayer.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(this.graph.nodeTypeNodes())
      .enter()
      .append('circle')
      .attr('class', 'node')
      .attr('id', d => d.path)
  }

  makeNodeCircleObjects () {
    return this.nwLayer.append('g')
      .attr('class', 'nodecircles')
      .selectAll('circle.nodecircle')
      .data(this.graph.nodeTypeNodes())
      .enter()
      .append('circle')
      .attr('class', 'nodecircle')
      .attr('id', d => d.path + '.bg')
  }

  makeTpLabelObjects () {
    return this.nwLayer.append('g')
      .attr('class', 'tplabels')
      .selectAll('text.tplabel')
      .data(this.graph.tpTypeNodes())
      .enter()
      .append('text')
      .attr('class', 'tplabel')
      .attr('id', d => d.path + '.tplb')
      .text(d => d.name)
  }

  makeNodeLabelObjects () {
    return this.nwLayer.append('g')
      .attr('class', 'nodelabels')
      .selectAll('text.nodelabel')
      .data(this.graph.nodeTypeNodes())
      .enter()
      .append('text')
      .attr('class', 'nodelabel')
      .attr('id', d => d.path + '.ndlb')
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
    this.graph.links.forEach(d => {
      d.source = d.sourceId
      d.target = d.targetId
    })
  }
}
