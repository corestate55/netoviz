'use strict'

export class Graph {
  constructor (nw) {
    this.name = nw.name
    this.nodes = nw.makeGraphNodes()
    this.links = nw.makeGraphLinks()
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
  }

  addParent (path) {
    this.parents.push(path)
  }

  childrenStr () {
    return this.children.join(',')
  }

  parentsStr () {
    return this.parents.join(',')
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
  }
}
