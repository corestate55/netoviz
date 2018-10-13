'use strict'

const TopoBaseContainer = require('./topo-base')
const Node = require('./node')
const Link = require('./link')

class SupportingNetwork extends TopoBaseContainer {
  constructor (data) {
    super(data)
    this.networkRef = data['network-ref']
    this.refPath = this.networkRef
  }
}

class NetworkTypes extends TopoBaseContainer {
  constructor (data) {
    super(data)
    this.data = data
    this.types = this.makeTypes(this.data)
  }

  makeTypes (data) {
    let types = []
    for (let type in data) {
      types.push(type)
      types = types.concat(this.makeTypes(data[type]))
    }
    return types
  }

  hasType (type) {
    return this.types && this.types.find(d => d === type)
  }
}

module.exports = class Network extends TopoBaseContainer {
  constructor (data, nwNum) {
    super(data)
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
    const tps = this.nodes.map(node => {
      return node.termPoints.map(tp => tp.graphNode())
    })
    return this.flatten(tps)
  }

  makeGraphNodes () {
    const nodes = [this.makeGraphNodesAsNode(), this.makeGraphNodesAsTp()]
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
    const linkKey = 'ietf-network-topology:link' // alias
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
    const links = this.links.map(link => link.graphLink())
    const linksNodeTp = this.nodes.map(node => {
      return node.termPoints.map(tp => tp.graphLink())
    })
    return this.flatten([links, this.flatten(linksNodeTp)])
  }

  isTypeLayer3 () {
    // network type check
    const nwL3TypeKey = 'ietf-l3-unicast-topology:l3-unicast-topology' // alias
    return this.networkTypes.hasType(nwL3TypeKey)
  }

  isTypeLayer2 () {
    // network type check
    const nwL2TypeKey = 'ietf-l2-topology:l2-network' // alias
    return this.networkTypes.hasType(nwL2TypeKey)
  }
}
