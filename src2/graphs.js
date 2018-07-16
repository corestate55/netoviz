'use strict'

import {BaseContainer} from './base'
import {Graph} from './graph'

export class Graphs extends BaseContainer {
  constructor(networks) {
    super()
    this.graphs = networks.networks.map((nw) => {
      return new Graph(nw)
    })
    this.allNodes = this.allNodes()
    this.makeParentRef()
    this.resolveLinkRef()
  }

  allNodes() {
    var allNodes = this.graphs.map((graph) => {
      return graph.nodes
    })
    return this.flatten(allNodes)
  }

  findNodeByPath(path) {
    return this.allNodes.find((d) => { return d.path === path })
  }

  makeParentRef() {
    this.allNodes.forEach((node) => {
      if (node.children) {
        node.children.forEach((path) => {
          var child = this.findNodeByPath(path)
          if (child) {
            child.addParent(node.path)
          } // TODO error check (when not found?)
        })
      }
    })
  }

  resolveLinkRef() {
    this.graphs.forEach((graph) => {
      graph.links.forEach((link) => {
        var source = this.findNodeByPath(link.source_path)
        var target = this.findNodeByPath(link.target_path)
        // TODO error check (when not found?)
        link.source_id = source.id
        link.target_id = target.id
      })
    })
  }
}
