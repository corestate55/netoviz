'use strict'

import {Network} from './network'

export class Networks {
  constructor(topoData) {
    var nwKey = 'ietf-network:networks' // alias
    this.networks = topoData[nwKey].network.map((nw, nwNum) => {
        return new Network(nw, nwNum + 1)
      })
  }
}
