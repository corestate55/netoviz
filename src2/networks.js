'use strict'

import {BaseContainer} from './base'
import {Network} from './network'

export class Networks extends BaseContainer {
  constructor (topoData) {
    super(topoData)
    var nwKey = 'ietf-network:networks' // alias
    this.networks = topoData[nwKey].network.map((nw, nwNum) => {
      return new Network(nw, nwNum + 1)
    })
  }

  makeGraphNodes () {
    var nodes = this.networks.map((nw) => {
      return nw.makeGraphNodes()
    })
    return this.flatten(nodes)
  }

  makeGraphLinks () {
    var links = this.networks.map((nw) => {
      return nw.makeGraphLinks()
    })
    return this.flatten(links)
  }
}
