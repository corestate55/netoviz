'use strict'

import * as d3 from 'd3'
import { SingleGraphVisualizer } from './single-visualizer'

export class ForceSimulatedVisualizer extends SingleGraphVisualizer {
  constructor (graph, findAllNodeFunc) {
    super(graph, findAllNodeFunc)
    // params for simulation
    this.delayedSimStop = null // stop simulation timer
    this.stopSimDelay = 8000 // time to stop simulation (msec)
    this.simAlpha = 0.3 // alpha target for force simulation
    // params for objects to draw/simulation
    const tpSize = 5 // tp circle radius
    const nodeSize = 20 // node width/height

    // functions to set parameters for simulation
    const linkDistance = (d) => {
      if (d.type === 'node-tp') {
        return nodeSize
      }
      return 2 * nodeSize // tp-tp (inter node)
    }

    // Set event callbacks for node/tp object (mouse dragging)
    // notice use arrow-function `() => {}' NOT `function(){}`
    // TO BIND `this`
    const ticked = () => {
      this.link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y)

      this.tp
        .attr('r', tpSize)
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)

      this.node
        .attr('r', nodeSize * 0.7)
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)

      this.nodeCircle
        .attr('r', nodeSize)
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)

      this.tpLabel
        .attr('x', d => d.x)
        .attr('y', d => d.y)
        .attr('dx', 1.5 * tpSize / 2) // offset to click tp easily

      this.nodeLabel
        .attr('x', d => d.x)
        .attr('y', d => d.y)
    }

    // make simulation
    this.simulation = d3.forceSimulation()
      .force('link',
        d3.forceLink()
          .id(d => d.id)
          .distance(linkDistance)
          .iterations(8)
      )
      .force('collide',
        d3.forceCollide()
          .strength(1.0) // collision not allowed
          .iterations(8)
      )
      .force('charge', d3.forceManyBody().strength(-50))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))

    this.simulation
      .nodes(this.graph.nodes)
      .on('tick', ticked)
      .force('link')
      .links(this.graph.links)

    // default state
    this.stopSimulation()
  }

  startSimulation () {
    this.simulation.alphaTarget(this.simAlpha).restart()
  }

  stopSimulation () {
    this.simulation.stop()
  }

  restartSimulation () {
    // d3.event is null when initialized this app
    if (d3.event === null || !d3.event.active) {
      this.startSimulation()
      // cancel before timer
      if (this.delayedSimStop) {
        this.delayedSimStop.stop()
      }
      // stop simulation after delay
      this.delayedSimStop = d3.timeout(() => this.stopSimulation(), this.stopSimDelay)
    }
  }
}
