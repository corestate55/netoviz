'use strict'

class SupportingTermPoint {
  constructor(data) {
    this.networkRef = data['network-ref']
    this.nodeRef = data['node-ref']
    this.tpRef = data['tp-ref']
    this.refPath = [this.networkRef, this.nodeRef, this.tpRef].join('/')
  }
}

export class TermPoint {
  constructor(data, nodePath, nodeId, tpNum) {
    this.name = data['tp-id'] // name string
    this.id = nodeId + tpNum
    this.path = [nodePath, this.name].join('/')

    this.supportingTermPoints = []
    var stpKey = 'supporting-termination-point' // alias
    if (data[stpKey]) {
      this.supportingTermPoints = data[stpKey].map((d) => {
        return new SupportingTermPoint(d)
      })
    }
  }

  graphNode() {
    return {
      'type': 'tp',
      'name': this.name,
      'id': this.id,
      'path': [super.path, this.tpId].join('/'),
      'children': "" // TODO
    }
  }
}
