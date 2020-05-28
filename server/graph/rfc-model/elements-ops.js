/**
 * @file definition of L2-type network elements.
 */

import RfcTermPoint from './term-point'
import RfcNode from './node'
import RfcLink from './link'
import RfcNetwork from './network'
import {
  OpsTermPointAttribute,
  OpsNodeAttribute,
  OpsLinkAttribute,
  OpsNetworkAttribute
} from './elements-opsattr'

/**
 * Ops term-point.
 * @extends {RfcTermPoint}
 */
class OpsTermPoint extends RfcTermPoint {
  /**
   * @override
   */
  constructor(data, nodePath, nodeId, tpNum) {
    super(data, nodePath, nodeId, tpNum)
    const attrKey = 'ops-topology:ops-termination-point-attributes' // alias
    /** @type {OpsTermPointAttribute} */
    this.attribute = new OpsTermPointAttribute(data[attrKey] || {})
  }
}

/**
 * Ops node.
 * @extends {RfcNetwork}
 */
class OpsNode extends RfcNode {
  /**
   * @override
   */
  constructor(data, nwPath, nwId, nodeNum) {
    super(data, nwPath, nwId, nodeNum)
    const attrKey = 'ops-topology:ops-node-attributes' // alias
    this.attribute = new OpsNodeAttribute(data[attrKey] || {})
  }

  /**
   * @override
   * @returns {OpsTermPoint}
   */
  newTP(data, index) {
    return new OpsTermPoint(data, this.path, this.id, index)
  }
}

/**
 * Ops link.
 * @extends {RfcLink}
 */
class OpsLink extends RfcLink {
  /**
   * @override
   */
  constructor(data, nwPath) {
    super(data, nwPath)
    const attrKey = 'ops-topology:ops-link-attributes'
    this.attribute = new OpsLinkAttribute(data[attrKey] || {})
  }
}

/**
 * Ops network.
 * @extends {RfcNetwork}
 */
export class OpsNetwork extends RfcNetwork {
  constructor(data, nwNum) {
    super(data, nwNum)
    const attrKey = 'ops-topology:ops-network-attributes'
    /** @type {OpsNetworkAttribute} */
    this.attribute = new OpsNetworkAttribute(data[attrKey] || {})
  }

  /**
   * @override
   * @returns {OpsNode}
   */
  newNode(data, index) {
    return new OpsNode(data, this.path, this.id, index)
  }

  /**
   * @override
   * @returns {OpsLink}
   */
  newLink(data) {
    return new OpsLink(data, this.path)
  }
}
