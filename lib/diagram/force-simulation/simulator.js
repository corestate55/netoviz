/**
 * @file Definition of class to visualize force-simulation network diagram
 */

import {
  forceSimulation,
  forceLink,
  forceCollide,
  forceManyBody,
  forceCenter
} from 'd3-force'
import { timeout } from 'd3-timer'
import ForceSimulationDiagramBuilder from './builder'

/**
 * Network diagram visualizer with force-simulation.
 * @extends {ForceSimulationDiagramBuilder}
 */
class ForceSimulationDiagramSimulator extends ForceSimulationDiagramBuilder {
  /**
   * @override
   */
  constructor(networkData, findNodeCallback) {
    super(networkData, findNodeCallback)
    // params for simulation
    /**
     * @type {Timer}
     */
    this.simulationStopTimer = null
    /**
     * Time to stop simulation (msec)
     * @const {number}
     */
    this.simulationStopDelay = 8000
    /**
     * Alpha target for force simulation
     * @const {number}
     */
    this.simulationAlpha = 0.3

    // simulation setup
    /** @type {function} */
    this.simulation = this._makeSimulation()
    this._setupSimulation()
    this.stopSimulation() // initial simulation state
  }

  /**
   * Make simulation. (a wrapper of force-simulation function generator)
   * @returns {function} Function of force-simulation.
   * @private
   */
  _makeSimulation() {
    return forceSimulation()
      .force(
        'link',
        forceLink()
          .id((d) => d.id)
          .distance((d) => this._linkDistance(d))
          .iterations(8)
      )
      .force(
        'collide',
        forceCollide()
          .strength(1.0) // collision not allowed
          .iterations(8)
      )
      .force('charge', forceManyBody().strength(-50))
      .force('center', forceCenter(this.width / 2, this.height / 2))
  }

  /**
   * Setup simulation.
   * @private
   */
  _setupSimulation() {
    this.simulation
      .nodes(this.networkData.nodes)
      .on('tick', () => this._ticked())
      .force('link')
      .links(this.networkData.links)
  }

  /**
   * Functions to set parameters for simulation.
   * (return link distance for node-tp and tp-tp link.)
   * @param {ForceSimulationNodeData} node - Node data.
   * @returns {number} Distance of link.
   * @private
   */
  _linkDistance(node) {
    if (node.type === 'node-tp') {
      return this.nodeSize
    }
    return 2 * this.nodeSize // tp-tp (inter node)
  }

  /**
   * Update link lines in each tick of simulation.
   * @private
   */
  _tickedLink() {
    this.linkLinesSelection
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y)
  }

  /**
   * Update term-point circles/labels in each tick of simulation.
   * @private
   */
  _tickedTermPoint() {
    this.termPointCirclesSelection.attr('cx', (d) => d.x).attr('cy', (d) => d.y)
    this.termPointLabelsSelection.attr('x', (d) => d.x).attr('y', (d) => d.y)
  }

  /**
   * Update node (inside/outside)circles and labels in each tick of simulation.
   * @private
   */
  _tickedNode() {
    this.nodeInnerCirclesSelection.attr('cx', (d) => d.x).attr('cy', (d) => d.y)
    this.nodeOuterCirclesSelection.attr('cx', (d) => d.x).attr('cy', (d) => d.y)
    this.nodeLabelsSelection.attr('x', (d) => d.x).attr('y', (d) => d.y)
  }

  /**
   * Event callback to update node/term-point svg elements.
   * @private
   */
  _ticked() {
    this._tickedLink()
    this._tickedTermPoint()
    this._tickedNode()
  }

  /**
   * Start simulation.
   * @protected
   */
  startSimulation() {
    this.simulation.alphaTarget(this.simulationAlpha).restart()
  }

  /**
   * Stop simulation.
   * @protected
   */
  stopSimulation() {
    this.simulation.stop()
  }

  /**
   * Restart (stop/start) simulation.
   * @public
   */
  restartSimulation() {
    this.startSimulation()
    // cancel before timer
    if (this.simulationStopTimer) {
      this.simulationStopTimer.stop()
    }
    // stop simulation after delay
    this.simulationStopTimer = timeout(
      () => this.stopSimulation(),
      this.simulationStopDelay
    )
  }
}

export default ForceSimulationDiagramSimulator
