'use strict'

import {Network} from './network'
import {L2Network, L3Network} from './aug-network'

export class Networks {
  constructor (topoData) {
    const nwKey = 'ietf-network:networks' // alias
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
