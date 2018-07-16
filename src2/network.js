'use strict'

import {Node} from './node'
import {Link} from './link'

class SupportingNetwork {
  constructor(data) {
    this.networkRef = data['network-ref']
  }
}

export class Network {
  constructor(data, nwNum) {
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
      this.links = data[linkKey].map((d) => {
        return new Link(d, this.path)
      })
    }
  }

  findNodeById(id) {
    return this.nodes.find((d) => {
      return d.id === id
    })
  }

  findNodeByPath(path) {
    return this.nodes.find((d) => {
      return d.path === path
    })
  }
}
