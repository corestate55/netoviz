'use strict'

export default class GraphNode {
  constructor(data) {
    this.type = data.type
    this.name = data.name
    this.id = data.id
    this.path = data.path
    this.children = data.children || [] // array of path(string)
    this.parents = data.parents || [] // array of path(string)
    this.attribute = data.attribute || {}
    this.diffState = data.diffState || {}
  }

  addParent(path) {
    this.parents.push(path)
  }
}
