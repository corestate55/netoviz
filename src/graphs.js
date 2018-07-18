'use strict'

import {BaseContainer} from './base'
import {Networks} from './networks'
import {Graph} from './graph'

export class Graphs extends BaseContainer {
  constructor (topoData) {
    super()
    this.topoModel = new Networks(topoData)
    this.graphs = this.topoModel.networks.map(nw => new Graph(nw))
    this.allGraphNodes = this.allGraphNodes()
    this.makeParentRef()
    this.resolveLinkRef()
  }

  allGraphNodes () {
    var allGraphNodes = this.graphs.map(graph => graph.nodes)
    return this.flatten(allGraphNodes)
  }

  findGraphNodeByPath (path) {
    return this.allGraphNodes.find(d => d.path === path)
  }

  makeParentRef () {
    this.allGraphNodes.forEach(node => {
      if (node.children) {
        node.children.forEach(path => {
          var child = this.findGraphNodeByPath(path)
          if (child) {
            child.addParent(node.path)
          } // TODO error check (when not found?)
        })
      }
    })
  }

  resolveLinkRef () {
    this.graphs.forEach(graph => {
      graph.links.forEach(link => {
        var source = this.findGraphNodeByPath(link.sourcePath)
        var target = this.findGraphNodeByPath(link.targetPath)
        link.sourceId = source.id
        link.targetId = target.id
      })
    })
  }
}
