'use strict'

import {TermPoint, L3TermPoint} from './term-points'
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

class L3Prefix {
  constructor (data) {
    this.prefix = data.prefix || ''
    this.metric = data.metric || 100
    this.flag = data.flag || [] // array
  }
}

class L3NodeAttribute {
  constructor (data) {
    this.name = data.name || ''
    this.flag = data.flag || ''
    this.routerId = data.routerId || [] // array
    this.prefix = [] // array
    if (data.prefix) {
      this.prefix = data.prefix.map(d => new L3Prefix(d))
    }
  }
}

export class L3Node extends Node {
  constructor (data, nwPath, nwId, nodeNum) {
    super(data, nwPath, nwId, nodeNum)
    let attrKey = 'ietf-l3-unicast-topology:l3-node-attributes' // alias
    this.attribute = new L3NodeAttribute(data[attrKey] || {}) // avoid undefined
  }

  newTP (data, index) {
    return new L3TermPoint(data, this.path, this.id, index)
  }
}
