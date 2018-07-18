'use strict'

import {GraphNode, GraphLink} from './graph'

class SupportingTermPoint {
  constructor (data) {
    this.networkRef = data['network-ref']
    this.nodeRef = data['node-ref']
    this.tpRef = data['tp-ref']
    this.refPath = [this.networkRef, this.nodeRef, this.tpRef].join('/')
  }
}

export class TermPoint {
  constructor (data, nodePath, nodeId, tpNum) {
    this.name = data['tp-id'] // name string
    this.id = nodeId + tpNum
    this.parentPath = nodePath
    this.path = [this.parentPath, this.name].join('/')
    this.constructSupportingTermPoints(data)
  }

  constructSupportingTermPoints (data) {
    this.supportingTermPoints = []
    var stpKey = 'supporting-termination-point' // alias
    if (data[stpKey]) {
      this.supportingTermPoints = data[stpKey].map(
        d => new SupportingTermPoint(d)
      )
    }
  }

  makeChildren () {
    var children = this.supportingTermPoints.map(stp => stp.refPath)
    children.unshift(this.parentPath)
    return children
  }

  graphNode () {
    return new GraphNode({
      'type': 'tp',
      'name': this.name,
      'id': this.id,
      'path': this.path,
      'children': this.makeChildren(),
      'attribute': this.attribute || {}
    })
  }

  graphLink () {
    var pathList = this.parentPath.split('/')
    var nodeName = pathList.pop()
    var linkName = [nodeName, this.name].join(',')
    return new GraphLink({
      'type': 'node-tp',
      'sourcePath': this.parentPath,
      'targetPath': this.path,
      'name': linkName,
      'path': [pathList, linkName].join('/'),
      'attribute': this.attribute || {}
    })
  }
}

class L3TPAttribute {
  constructor (data) {
    // TODO: choice ip/unnumbered/interface-name,
    // but, now use only ip
    this.ipAddress = data['ip-address'] || [] // notice: array
  }

  toHtml () {
    return `
<ul>
 <li>IP Address: ${this.ipAddress}</li>
</ul>
`
  }
}

export class L3TermPoint extends TermPoint {
  constructor (data, nodePath, nodeId, tpNum) {
    super(data, nodePath, nodeId, tpNum)
    let attrKey = 'ietf-l3-unicast-topology:l3-termination-point-attributes' // alias
    this.attribute = new L3TPAttribute(data[attrKey] || {}) // avoid undefined
  }
}
