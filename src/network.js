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

class NetworkTypes {
  constructor (data) {
    this.data = data
    this.types = this.makeTypes(this.data)
  }

  makeTypes (data) {
    let types = []
    for (let type in data) {
      types.push(type)
      if (data[type]) {
        types = types.concat(this.makeTypes(data[type]))
      }
    }
    return types
  }

  hasType (type) {
    if (this.types && this.types.find(d => d === type)) {
      return true
    }
    return false
  }
}

export class Network extends BaseContainer {
  constructor (data, nwNum) {
    super()
    this.networkTypes = new NetworkTypes(data['network-types'])
    this.name = data['network-id'] // name string
    this.id = nwNum * 10000 // integer
    this.path = this.name
    this.constructSupportingNetworks(data)
    this.constructNodes(data)
    this.constructLinks(data)
  }

  constructSupportingNetworks (data) {
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
    var tps = this.nodes.map(node => {
      return node.termPoints.map(tp => tp.graphNode())
    })
    return this.flatten(tps)
  }

  makeGraphNodes () {
    var nodes = [this.makeGraphNodesAsNode(), this.makeGraphNodesAsTp()]
    return this.flatten(nodes)
  }

  constructNodes (data) {
    this.nodes = []
    if (data['node']) {
      this.nodes = data['node'].map((d, i) => {
        return this.newNode(d, i + 1)
      })
    }
  }

  newNode (data, index) {
    return new Node(data, this.path, this.id, index)
  }

  constructLinks (data) {
    this.links = []
    var linkKey = 'ietf-network-topology:link' // alias
    if (data[linkKey]) {
      this.links = data[linkKey].map((d) => {
        return this.newLink(d)
      })
    }
  }

  newLink (data) {
    return new Link(data, this.path)
  }

  makeGraphLinks () {
    var links = this.links.map(link => link.graphLink())
    var linksNodeTp = this.nodes.map(node => {
      return node.termPoints.map(tp => tp.graphLink())
    })
    linksNodeTp = this.flatten(linksNodeTp)
    return this.flatten([links, linksNodeTp])
  }

  isTypeLayer3 () {
    // network type check
    let nwL3TypeKey = 'ietf-l3-unicast-topology:l3-unicast-topology' // alias
    return this.networkTypes.hasType(nwL3TypeKey)
  }
}
