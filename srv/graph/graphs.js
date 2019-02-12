'use strict'

import BaseContainer from '../base'
import Networks from '../topo-model/networks'
import Graph from './graph'

export default class Graphs extends BaseContainer {
  constructor (topoData) {
    super()
    this.topoModel = new Networks(topoData)
    this.graphs = this.topoModel.networks.map(nw => new Graph(nw))
    this.allGraphNodes = this.allGraphNodes()
    this.makeParentRef()
    this.resolveLinkRef()
  }

  allGraphNodes () {
    const allGraphNodes = this.graphs.map(graph => graph.nodes)
    return this.flatten(allGraphNodes)
  }

  findGraphNodeByPath (path) {
    return this.allGraphNodes.find(d => d.path === path)
  }

  makeParentRef () {
    for (const node of this.allGraphNodes) {
      if (node.children) {
        for (const path of node.children) {
          const child = this.findGraphNodeByPath(path)
          if (child) {
            child.addParent(node.path)
          } // TODO error check (when not found?)
        }
      }
    }
  }

  resolveLinkRef () {
    for (const graph of this.graphs) {
      for (const link of graph.links) {
        const source = this.findGraphNodeByPath(link.sourcePath)
        const target = this.findGraphNodeByPath(link.targetPath)
        link.sourceId = source.id
        link.targetId = target.id
      }
    }
  }
}
