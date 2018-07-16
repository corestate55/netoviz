'use strict'

import {TermPoint} from './term-points'

class SupportingNode {
  constructor(data) {
    this.networkRef = data['network-ref']
    this.nodeRef = data['node-ref']
    this.refPath = [this.networkRef, this.nodeRef].join('/')
  }

  refPath() {
    return [this.networkRef, this.nodeRef].join('/')
  }
}

export class Node {
  constructor(data, nwPath, nwId, nodeNum) {
    this.name = data['node-id'] // name string
    this.id = nwId + nodeNum * 100
    this.parentPath = nwPath
    this.path = [this.parentPath, this.name].join('/')

    this.termPts = []
    var tpKey = ['ietf-network-topology:termination-point'] // alias
    if (data[tpKey]) {
      this.termPoints = data[tpKey].map((d, i) => {
        return new TermPoint(d, this.path, this.id, i + 1)
      })
    }

    this.supportingNodes = []
    if (data['supporting-node'] ) {
      this.supportingNodes = data['supporting-node'].map((d) => {
        return new SupportingNode(d)
      })
    }
  }

  graphNode() {
    return {
      'type': 'node',
      'name': this.name,
      'id': this.id,
      'path': this.path,
      'children': "" // TODO
    }
  }
}
