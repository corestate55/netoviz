'use strict'

import {BaseContainer} from './base'
import {Networks} from './networks'
import {Graph} from './graph'

export class Graphs extends BaseContainer {
  constructor (topoData) {
    super()
    this.topoModel = new Networks(topoData)
    this.graphs = this.topoModel.networks.map(nw => new Graph(nw))
    this.allNodes = this.allNodes()
    this.makeParentRef()
    this.resolveLinkRef()
  }

  allNodes () {
    var allNodes = this.graphs.map(graph => graph.nodes)
    return this.flatten(allNodes)
  }

  findNodeByPath (path) {
    return this.allNodes.find(d => d.path === path)
  }

  makeParentRef () {
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

  resolveLinkRef () {
    this.graphs.forEach((graph) => {
      graph.links.forEach((link) => {
        var source = this.findNodeByPath(link.sourcePath)
        var target = this.findNodeByPath(link.targetPath)
        link.sourceId = source.id
        link.targetId = target.id
      })
    })
  }
}
