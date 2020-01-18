'use strict'
/**
 * @file Definition of networks class of topology model.
 */
import RfcModelBase from './base'
import RfcNetwork from './network'
import RfcL2Network from './l2network'
import RfcL3Network from './l3network'

/**
 * Networks of topology model.
 * (Container of multiple networks.)
 * @extends {RfcModelBase}
 */
class RfcTopology extends RfcModelBase {
  /**
   * @typedef {Object} RfcTopologyData
   * @prop {RfcNetworksContainerData} ietf-network:networks - Container of Networks
   */
  /**
   * @typedef {Object} RfcNetworksData
   * @prop {Array<RfcNetwork>} network - Networks
   */
  /**
   * @param {RfcTopologyData} rfcTopologyData
   */
  constructor(rfcTopologyData) {
    const nwKey = 'ietf-network:networks' // alias
    super(rfcTopologyData[nwKey])
    /** @type {Array<RfcNetwork|RfcL2Network|RfcL3Network>} */
    this.networks = rfcTopologyData[nwKey].network.map((nw, nwNum) => {
      return this.newNetwork(nw, nwNum + 1)
    })
  }

  /**
   * Create (new) network.
   * @param {RfcNetworkData} data - Network data.
   * @param {number} nwNum - ID of network.
   * @returns {RfcNetwork|RfcL2Network|RfcL3Network}
   * @protected
   */
  newNetwork(data, nwNum) {
    const nw = new RfcNetwork(data, nwNum)
    // if network has augmented type, re-generate its type
    if (nw.isTypeLayer3()) {
      return new RfcL3Network(data, nwNum)
    } else if (nw.isTypeLayer2()) {
      return new RfcL2Network(data, nwNum)
    }
    return nw
  }
}

export default RfcTopology
