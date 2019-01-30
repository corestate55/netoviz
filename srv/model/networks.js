'use strict'

import TopoBaseContainer from './topo-base'
import Network from './network'
import L2Network from './l2network'
import L3Network from './l3network'

export default class Networks extends TopoBaseContainer {
  constructor (topoData) {
    const nwKey = 'ietf-network:networks' // alias
    super(topoData[nwKey])
    this.networks = topoData[nwKey].network.map((nw, nwNum) => {
      return this.newNetwork(nw, nwNum + 1)
    })
  }

  newNetwork (data, index) {
    const nw = new Network(data, index)
    // if network has augmented type, re-generate its type
    if (nw.isTypeLayer3()) {
      return new L3Network(data, index)
    } else if (nw.isTypeLayer2()) {
      return new L2Network(data, index)
    }
    return nw
  }
}
