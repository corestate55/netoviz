'use strict'

import localStorage from 'localStorage'

export default class PositionCache {
  // save node position in all graphs
  saveGraphs(key, graphs) {
    const positionData = { graphs: [] }
    for (const graph of graphs) {
      const g = {}
      g.name = graph.name
      g.nodes = graph.nodes
        .filter(node => node.fx && node.fy)
        .map(node => {
          const n = {}
          n.path = node.path
          n.id = node.id
          n.fx = node.fx || null
          n.fy = node.fy || null
          return n
        })
      positionData.graphs.push(g)
    }
    const dataStr = JSON.stringify(positionData)
    localStorage.setItem(key, dataStr)
  }

  findNodeDataToLoad(cachedGraph, graph, graphVisualizer) {
    for (const cachedNode of cachedGraph.nodes) {
      const node = graph.nodes.find(n => n.id === cachedNode.id)
      if (node) {
        node.fx = cachedNode.fx
        node.fy = cachedNode.fy
        graphVisualizer.markTarget(node, ['fixed', true])
      }
    }
  }

  findGraphDataToLoad(dataStr, graph, graphVisualizer) {
    const positionData = JSON.parse(dataStr)
    const cachedGraph = positionData.graphs.find(cg => cg.name === graph.name)
    if (cachedGraph) {
      this.findNodeDataToLoad(cachedGraph, graph, graphVisualizer)
    }
  }

  // NOTICE: use "per graph" to loading data
  loadToGraph(key, graph, graphVisualizer) {
    const dataStr = localStorage.getItem(key)
    if (dataStr !== null) {
      this.findGraphDataToLoad(dataStr, graph, graphVisualizer)
    }
  }
}
