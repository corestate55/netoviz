'use strict'

import {Network} from './network'

export class Networks {
  constructor(topoData) {
    var nwKey = 'ietf-network:networks' // alias
    this.networks = topoData[nwKey].network.map((nw, nwNum) => {
        return new Network(nw, nwNum + 1)
      })
  }

  makeGraphNodes() {
    var nodes = this.networks.map((nw) => {
      return nw.makeGraphNodes()
    })
    return Array.prototype.concat.apply([], nodes) // flatten
  }

  makeGraphLinks() {
    var links = this.networks.map((nw) => {
      return nw.makeGraphLinks()
    })
    return Array.prototype.concat.apply([], links) // flatten
  }
}
