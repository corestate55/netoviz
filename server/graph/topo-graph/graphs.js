'use strict'

import BaseContainer from '../common/base'
import Networks from '../topo-model/networks'
import Graph from './graph'

export default class Graphs extends BaseContainer {
  constructor(topoData) {
    super()
    this.topoModel = new Networks(topoData)
    this.graphs = this.topoModel.networks.map(nw => new Graph(nw))
    this.allGraphNodes = this.makeAllGraphNodes()
    this.makeParentRef()
    this.resolveLinkRef()
  }

  makeAllGraphNodes() {
    const allGraphNodes = this.graphs.map(graph => graph.nodes)
    return this.flatten(allGraphNodes)
  }

  findGraphNodeByPath(path) {
    return this.allGraphNodes.find(d => d.path === path)
  }

  makeParentRef() {
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

  checkFoundNode(targetStr, target, link) {
    if (!target) {
      console.error(`${targetStr} does not found, in link:`, link)
    }
  }

  resolveLinkRef() {
    for (const graph of this.graphs) {
      for (const link of graph.links) {
        const source = this.findGraphNodeByPath(link.sourcePath)
        const target = this.findGraphNodeByPath(link.targetPath)
        this.checkFoundNode('Source', source, link)
        this.checkFoundNode('Target', target, link)
        link.sourceId = source.id
        link.targetId = target.id
      }
    }
  }

  /**
   * Convert graphs as graph data.
   * @returns {TopologyGraphData} Graph data for topology view.
   * @public
   */
  toData() {
    /** @typedef {Object} TopologyGraphData */
    return this.graphs
  }
}
