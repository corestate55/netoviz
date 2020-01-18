'use strict'
/**
 * @file Definition of layer2 node class of topology model.
 */

import Node from './node'
import L2TermPoint from './l2term-point'
import L2NodeAttribute from './node-l2attr'

// TODO: `@extends {Node}` occurs 'Closure compiler syntax inspection' warnings.
// noinspection JSClosureCompilerSyntax

/**
 * Layer2 node class.
 * @extends {Node}
 */
class L2Node extends Node {
  /**
   * @override
   */
  constructor(data, nwPath, nwId, nodeNum) {
    super(data, nwPath, nwId, nodeNum)
    const attrKey = 'ietf-l2-topology:l2-node-attributes' // alias
    this.attribute = new L2NodeAttribute(data[attrKey] || {}) // avoid undefined
  }

  /**
   * @override
   * @returns {L2TermPoint}
   */
  newTP(data, index) {
    return new L2TermPoint(data, this.path, this.id, index)
  }
}

export default L2Node
