'use strict'

export default class Graph {
  constructor(nw) {
    this.name = nw.name
    this.nodes = nw.makeGraphNodes()
    this.links = nw.makeGraphLinks()
    this.diffState = nw.diffState
  }
}
