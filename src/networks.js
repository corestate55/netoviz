'use strict'

import {Network} from './network'
import {L3Network} from './aug-network'

export class Networks {
  constructor (topoData) {
    var nwKey = 'ietf-network:networks' // alias
    this.networks = topoData[nwKey].network.map((nw, nwNum) => {
      return this.newNetwork(nw, nwNum + 1)
    })
  }

  newNetwork (data, index) {
    let nw = new Network(data, index)
    if (nw.isTypeLayer3()) {
      return new L3Network(data, index)
    }
    return nw
  }
}
