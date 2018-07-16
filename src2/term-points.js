'use strict'

import {graphNode, graphLink} from './graph'

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

    this.supportingTermPoints = []
    var stpKey = 'supporting-termination-point' // alias
    if (data[stpKey]) {
      this.supportingTermPoints = data[stpKey].map((d) => {
        return new SupportingTermPoint(d)
      })
    }
  }

  makeChildren () {
    var children = this.supportingTermPoints.map((stp) => {
      return stp.refPath
    })
    children.unshift(this.parentPath)
    return children
  }

  graphNode () {
    return new graphNode({
      'type': 'tp',
      'name': this.name,
      'id': this.id,
      'path': this.path,
      'children': this.makeChildren()
    })
  }

  graphLink () {
    var pathList = this.parentPath.split('/')
    var nodeName = pathList.pop()
    var linkName = [nodeName, this.name].join(',')
    return new graphLink({
      'type': 'node-tp',
      'source_path': this.parentPath,
      'target_path': this.path,
      'name': linkName,
      'path': [pathList, linkName].join('/')
    })
  }
}
