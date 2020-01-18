'use strict'
/**
 * @file Definition of link and supporting-link class of topology model.
 */

import ForceSimulationLink from '../force-simulation/link'
import RfcModelBase from './base'

/**
 * Reference to term-point.
 * @extends {RfcModelBase}
 */
class RfcLinkTpRef extends RfcModelBase {
  /**
   * @typedef {Object} RfcLinkTpRefData
   * @prop {string} source-node - Name of source node.
   * @prop {string} source-tp - Name of source term-point.
   * @prop {string} dest-node - Name of destination node.
   * @prop {string} dest-tp - Name of destination term-point.
   */
  /**
   * @param {RfcLinkTpRefData} data - Relative term-path (no network path).
   * @param {string} nwPath - Path of network.
   */
  constructor(data, nwPath) {
    super(data)
    /** @type {string} */
    this.nodeRef = data['source-node'] || data['dest-node']
    /** @type {string} */
    this.tpRef = data['source-tp'] || data['dest-tp']
    /** @type {string} */
    this.refPath = [nwPath, this.nodeRef, this.tpRef].join('__')
  }
}

/**
 * Supporting link of topology model.
 * @extends {RfcModelBase}
 */
class RfcSupportingLink extends RfcModelBase {
  /**
   * @typedef {Object} RfcSupportingLinkData
   * @prop {string} network-ref - Network name.
   * @prop {string} link-ref - Link name.
   */
  /**
   * @param {RfcSupportingLinkData} data - Data of supporting link.
   */
  constructor(data) {
    super(data)
    /** @type {string} */
    this.networkRef = data['network-ref']
    /** @type {string} */
    this.linkRef = data['link-ref']
  }
}

/**
 * Link of topology model.
 * @extends {RfcModelBase}
 */
class RfcLink extends RfcModelBase {
  /**
   * @typedef {Object} RfcLinkData
   * @prop {string} link-id - Name of link.
   * @prop {RfcLinkTpRefData} source - Source term-point ref.
   * @prop {RfcLinkTpRefData} destination - Destination term-point ref.
   */
  /**
   * @param {RfcLinkData} data - Link data.
   * @param {string} nwPath - Path of network (contains this link).
   */
  constructor(data, nwPath) {
    super(data)
    /** @type {string} */
    this.name = data['link-id'] // name string
    /** @type {string} */
    this.path = [nwPath, this.name].join('__')
    /** @type {RfcLinkTpRef} */
    this.source = new RfcLinkTpRef(data.source, nwPath)
    /** @type {RfcLinkTpRef} */
    this.destination = new RfcLinkTpRef(data.destination, nwPath)
    this._constructSupportingLinks(data)
  }

  /**
   * Construct supporting-links.
   * @param {RfcLinkData} data - Link data.
   * @private
   */
  _constructSupportingLinks(data) {
    /** @type {Array<RfcSupportingLink>} */
    this.supportingLinks = []
    if (data['supporting-link']) {
      this.supportingLinks = data['supporting-link'].map(
        d => new RfcSupportingLink(d)
      )
    }
  }

  /**
   * Convert RfcLink to ForceSimulationLink.
   * @returns {ForceSimulationLink}
   * @public
   */
  graphLink() {
    return new ForceSimulationLink({
      type: 'tp-tp',
      sourcePath: this.source.refPath,
      targetPath: this.destination.refPath,
      name: this.name,
      path: this.path,
      attribute: this.attribute || {},
      diffState: this.diffState
    })
  }
}

export default RfcLink
