'use strict'

import {BaseContainer} from './base'
import {Node} from './node'
import {Link} from './link'

class SupportingNetwork {
  constructor (data) {
    this.networkRef = data['network-ref']
    this.refPath = this.networkRef
  }
}

export class Network extends BaseContainer {
  constructor (data, nwNum) {
    super()
    this.networkTypes = data['network-types']
    this.name = data['network-id'] // name string
    this.id = nwNum * 10000 // integer
    this.path = this.name

    this.nodes = []
    if (data['node']) {
      this.nodes = data['node'].map((d, i) => {
        return new Node(d, this.path, this.id, i + 1)
      })
    }

    this.links = []
    var linkKey = 'ietf-network-topology:link' // alias
    if (data[linkKey]) {
      this.links = data[linkKey].map(d => new Link(d, this.path))
    }

    this.supportingNetworks = []
    if (data['supporting-network']) {
      this.supportingNetworks = data['supporting-network'].map(
        d => new SupportingNetwork(d)
      )
    }
  }

  makeGraphNodesAsNode () {
    return this.nodes.map(node => node.graphNode())
  }

  makeGraphNodesAsTp () {
    var tps = this.nodes.map((node) => {
      return node.termPoints.map(tp => tp.graphNode())
    })
    return this.flatten(tps)
  }

  makeGraphNodes () {
    var nodes = [this.makeGraphNodesAsNode(), this.makeGraphNodesAsTp()]
    return this.flatten(nodes)
  }

  makeGraphLinks () {
    var links = this.links.map(link => link.graphLink())
    var linksNodeTp = this.nodes.map((node) => {
      return node.termPoints.map(tp => tp.graphLink())
    })
    linksNodeTp = this.flatten(linksNodeTp)
    return this.flatten([links, linksNodeTp])
  }
}
