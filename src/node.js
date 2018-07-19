'use strict'

import {TermPoint} from './term-points'
import {GraphNode} from './graph'

class SupportingNode {
  constructor (data) {
    this.networkRef = data['network-ref']
    this.nodeRef = data['node-ref']
    this.refPath = [this.networkRef, this.nodeRef].join('/')
  }
}

export class Node {
  constructor (data, nwPath, nwId, nodeNum) {
    this.name = data['node-id'] // name string
    this.id = nwId + nodeNum * 100
    this.parentPath = nwPath
    this.path = [this.parentPath, this.name].join('/')
    this.constructSupportingNodes(data)
    this.constructTermPts(data)
  }

  constructTermPts (data) {
    this.termPoints = []
    var tpKey = ['ietf-network-topology:termination-point'] // alias
    if (data[tpKey]) {
      this.termPoints = data[tpKey].map((d, i) => {
        return this.newTP(d, i + 1)
      })
    }
  }

  newTP (data, index) {
    return new TermPoint(data, this.path, this.id, index)
  }

  constructSupportingNodes (data) {
    this.supportingNodes = []
    if (data['supporting-node']) {
      this.supportingNodes = data['supporting-node'].map(
        d => new SupportingNode(d)
      )
    }
  }

  findTpByPath (path) {
    return this.termPoints.find(d => d.path === path)
  }

  makeChildren () {
    return this.supportingNodes.map(sn => sn.refPath)
  }

  graphNode () {
    return new GraphNode({
      'type': 'node',
      'name': this.name,
      'id': this.id,
      'path': this.path,
      'children': this.makeChildren(),
      'attribute': this.attribute || {}
    })
  }
}
