'use strict'

const TopoBaseContainer = require('./topo-base')
const GraphLink = require('../graph/graph-link')

class TpRef extends TopoBaseContainer {
  constructor (data, nwPath) {
    super(data)
    this.nodeRef = data['source-node'] || data['dest-node']
    this.tpRef = data['source-tp'] || data['dest-tp']
    this.refPath = [nwPath, this.nodeRef, this.tpRef].join('/')
  }
}

class SupportingLink extends TopoBaseContainer {
  constructor (data) {
    super(data)
    this.networkRef = data['network-ref']
    this.linkRef = data['link-ref']
  }
}

module.exports = class Link extends TopoBaseContainer {
  constructor (data, nwPath) {
    super(data)
    this.name = data['link-id'] // name string
    this.path = [nwPath, this.name].join('/')
    this.source = new TpRef(data['source'], nwPath)
    this.destination = new TpRef(data['destination'], nwPath)
    this.constructSupportingLinks(data)
  }

  constructSupportingLinks (data) {
    this.supportingLinks = []
    if (data['supporting-link']) {
      this.supportingLinks = data['supporting-link'].map(
        d => new SupportingLink(d)
      )
    }
  }

  graphLink () {
    return new GraphLink({
      'type': 'tp-tp',
      'sourcePath': this.source.refPath,
      'targetPath': this.destination.refPath,
      'name': this.name,
      'path': this.path,
      'attribute': this.attribute || {},
      'diffState': this.diffState
    })
  }
}
