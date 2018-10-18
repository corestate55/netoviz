'use strict'

import * as d3 from 'd3-force'
import { event } from 'd3-selection'
import { timeout } from 'd3-timer'
import { SingleGraphVisualizer } from './single-visualizer'

export class ForceSimulatedVisualizer extends SingleGraphVisualizer {
  constructor (graph, findAllNodeFunc) {
    super(graph, findAllNodeFunc)
    // params for simulation
    this.simStopCallback = null
    this.simStopDelay = 8000 // time to stop simulation (msec)
    this.simAlpha = 0.3 // alpha target for force simulation
    // params for objects to draw/simulation
    this.tpSize = 5 // tp circle radius
    this.nodeSize = 20 // node width/height

    // simulation setup
    this.simulation = this.makeSimulation()
    this.setupSimulation()
    this.stopSimulation() // initial simulation state
  }

  makeSimulation () {
    return d3.forceSimulation()
      .force('link',
        d3.forceLink()
          .id(d => d.id)
          .distance((d) => this.linkDistance(d))
          .iterations(8)
      )
      .force('collide',
        d3.forceCollide()
          .strength(1.0) // collision not allowed
          .iterations(8)
      )
      .force('charge', d3.forceManyBody().strength(-50))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
  }

  setupSimulation () {
    this.simulation
      .nodes(this.graph.nodes)
      .on('tick', () => this.ticked())
      .force('link')
      .links(this.graph.links)
  }

  // functions to set parameters for simulation
  linkDistance (d) {
    if (d.type === 'node-tp') {
      return this.nodeSize
    }
    return 2 * this.nodeSize // tp-tp (inter node)
  }

  tickedLink () {
    this.link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)
  }

  tickecTermPoint () {
    this.tp
      .attr('r', this.tpSize)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
    this.tpLabel
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('dx', 1.5 * this.tpSize / 2) // offset to click tp easily
  }

  tickedNode () {
    this.node
      .attr('r', this.nodeSize * 0.7)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
    this.nodeCircle
      .attr('r', this.nodeSize)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
    this.nodeLabel
      .attr('x', d => d.x)
      .attr('y', d => d.y)
  }

  // Set event callbacks for node/tp object (mouse dragging)
  ticked () {
    this.tickedLink()
    this.tickecTermPoint()
    this.tickedNode()
  }

  startSimulation () {
    this.simulation.alphaTarget(this.simAlpha).restart()
  }

  stopSimulation () {
    this.simulation.stop()
  }

  restartSimulation () {
    // d3.event is null when initialized this app
    if (event === null || !event.active) {
      this.startSimulation()
      // cancel before timer
      if (this.simStopCallback) {
        this.simStopCallback.stop()
      }
      // stop simulation after delay
      this.simStopCallback = timeout(() => this.stopSimulation(), this.simStopDelay)
    }
  }
}
