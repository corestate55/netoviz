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
      .attr('id', this.graph.name)
      .attr('class', ['network', this.graph.diffState.detect()].join(' '))
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
      .attr('class', 'links')
      .selectAll('line')
      .data(this.graph.links)
      .enter()
      .append('line')
      .attr('id', d => d.path)
      .attr('class', d => ['link', d.diffState.detect()].join(' '))
  }

  makeTpObjects () {
    return this.nwLayer.append('g')
      .attr('class', 'terminalpoints')
      .selectAll('circle.tp')
      .data(this.graph.tpTypeNodes())
      .enter()
      .append('circle')
      .attr('class', d => ['tp', d.diffState.detect()].join(' '))
      .attr('id', d => d.path)
  }

  makeNodeObjects () {
    return this.nwLayer.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(this.graph.nodeTypeNodes())
      .enter()
      .append('circle')
      .attr('class', d => ['node', d.diffState.detect()].join(' '))
      .attr('id', d => d.path)
  }

  makeNodeCircleObjects () {
    return this.nwLayer.append('g')
      .attr('class', 'nodecircles')
      .selectAll('circle.nodecircle')
      .data(this.graph.nodeTypeNodes())
      .enter()
      .append('circle')
      .attr('class', d => ['nodecircle', d.diffState.detect()].join(' '))
      .attr('id', d => `${d.path}.bg`) // background
  }

  makeTpLabelObjects () {
    return this.nwLayer.append('g')
      .attr('class', 'tplabels')
      .selectAll('text.tplabel')
      .data(this.graph.tpTypeNodes())
      .enter()
      .append('text')
      .attr('class', 'tplabel')
      .attr('id', d => `${d.path}.tplb`) // tp label
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
      .attr('id', d => `${d.path}.ndlb`) // node label
      .text(d => d.name)
  }

  setCavasSize () {
    const graphSize = this.graph.nodes.length
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
    for (const d of this.graph.links) {
      d.source = d.sourceId
      d.target = d.targetId
    }
  }
}
