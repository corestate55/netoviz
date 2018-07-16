'use strict'

export class Graph {
  constructor(nw) {
    this.name = nw.name
    this.nodes = nw.makeGraphNodes()
    this.links = nw.makeGraphLinks()
  }
}

export class graphNode {
  constructor(data) {
    this.type = data.type
    this.name = data.name
    this.id = data.id
    this.path = data.path
    this.children = data.children || [] // array of path(string)
    this.parents = data.parents || [] // array of path(string)
  }

  addParent(path) {
    this.parents.push(path)
  }

  childrenStr() {
    return this.children.join(',')
  }

  parentsStr() {
    return this.parents.join(',')
  }
}

export class graphLink {
  constructor(data) {
    this.type = data.type
    this.source_path = data.source_path
    this.target_path = data.target_path
    // if source/target id === 0, then error
    this.source_id = data.source_id || 0
    this.target_id = data.target_id || 0
    this.name = data.name
    this.path = data.path
  }
}
