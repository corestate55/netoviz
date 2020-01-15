'use strict'
/**
 * @file Definition of networks class of topology model.
 */
import TopoBaseContainer from './topo-base'
import Network from './network'
import L2Network from './l2network'
import L3Network from './l3network'

/**
 * Networks of topology model.
 * (Container of multiple networks.)
 * @extends {TopoBaseContainer}
 */
class Networks extends TopoBaseContainer {
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
    /** @type {Array<Network|L2Network|L3Network>} */
    this.networks = rfcTopologyData[nwKey].network.map((nw, nwNum) => {
      return this.newNetwork(nw, nwNum + 1)
    })
  }

  /**
   * Create (new) network.
   * @param {RfcNetworkData} data - Network data.
   * @param {number} nwNum - ID of network.
   * @returns {Network|L2Network|L3Network}
   * @protected
   */
  newNetwork(data, nwNum) {
    const nw = new Network(data, nwNum)
    // if network has augmented type, re-generate its type
    if (nw.isTypeLayer3()) {
      return new L3Network(data, nwNum)
    } else if (nw.isTypeLayer2()) {
      return new L2Network(data, nwNum)
    }
    return nw
  }
}

export default Networks
