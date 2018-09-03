'use strict'

export class Graph {
  constructor (nw) {
    this.name = nw.name
    this.nodes = nw.makeGraphNodes()
    this.links = nw.makeGraphLinks()
    this.diffState = nw.diffState
  }

  tpTypeNodes () {
    return this.nodes.filter(d => d.type === 'tp')
  }

  nodeTypeNodes () {
    return this.nodes.filter(d => d.type === 'node')
  }
}

export class GraphNode {
  constructor (data) {
    this.type = data.type
    this.name = data.name
    this.id = data.id
    this.path = data.path
    this.children = data.children || [] // array of path(string)
    this.parents = data.parents || [] // array of path(string)
    this.attribute = data.attribute || {}
    this.diffState = data.diffState || {}
  }

  addParent (path) {
    this.parents.push(path)
  }
}

export class GraphLink {
  constructor (data) {
    this.name = data.name
    this.path = data.path
    this.type = data.type
    this.sourcePath = data.sourcePath
    this.targetPath = data.targetPath
    // Link termination point ID (0 means error...)
    this.sourceId = data.sourceId || 0
    this.targetId = data.targetId || 0
    this.attribute = data.attribute || {}
    this.diffState = data.diffState || {}
  }
}
