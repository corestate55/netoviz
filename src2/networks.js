'use strict'

import {BaseContainer} from './base'
import {Network} from './network'

export class Networks extends BaseContainer {
  constructor (topoData) {
    super()
    var nwKey = 'ietf-network:networks' // alias
    this.networks = topoData[nwKey].network.map((nw, nwNum) => {
      return new Network(nw, nwNum + 1)
    })
  }
}
