'use strict'
/**
 * @file Definition of layer3 node class of topology model.
 */

import Node from './node'
import L3TermPoint from './l3term-point'
import L3NodeAttribute from './node-l3attr'

// TODO: `@extends {Node}` occurs 'Closure compiler syntax inspection' warnings.
// noinspection JSClosureCompilerSyntax

/**
 * Layer3 node class.
 * @extends {Node}
 */
class L3Node extends Node {
  /**
   * @override
   */
  constructor(data, nwPath, nwId, nodeNum) {
    super(data, nwPath, nwId, nodeNum)
    const attrKey = 'ietf-l3-unicast-topology:l3-node-attributes' // alias
    this.attribute = new L3NodeAttribute(data[attrKey] || {}) // avoid undefined
  }

  /**
   * @override
   * @returns {L3TermPoint}
   */
  newTP(data, index) {
    return new L3TermPoint(data, this.path, this.id, index)
  }
}

export default L3Node
