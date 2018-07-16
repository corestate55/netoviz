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

  makeGraphNodesAsNode() {
    return this.nodes.map((node) => {
      return node.graphNode()
    })
  }

  makeGraphNodesAsTp() {
    var tps = this.nodes.map((node) => {
      return node.termPoints.map((tp) => {
        return tp.graphNode()
      })
    })
    return Array.prototype.concat.apply([], tps) // flatten
  }

  makeGraphNodes() {
    var gNodes = [this.makeGraphNodesAsNode(), this.makeGraphNodesAsTp()]
    return Array.prototype.concat.apply([], gNodes) // flatten
  }

  makeGraphLinks() {
    var gLinks = this.links.map((link) => {
      return link.graphLink()
    })
    var gLinksNodeTp = this.nodes.map((node) => {
      return node.termPoints.map((tp) => {
        return tp.graphLink()
      })
    })
    gLinksNodeTp = Array.prototype.concat.apply([], gLinksNodeTp) // flatten
    return Array.prototype.concat.apply([], [gLinks, gLinksNodeTp]) // flatten
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
