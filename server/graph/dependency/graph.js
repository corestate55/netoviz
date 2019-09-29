import markFamilyWithTarget from '../common/family-maker'
import DepGraphLayer from './layer'

export default class DepGraph {
  constructor(graphQuery) {
    const foundTarget = this.markFamilyWithTarget(
      graphQuery.graphData,
      graphQuery.target
    )
    this.setLayers(graphQuery.graphData, foundTarget)
  }

  markFamilyWithTarget(graphData, target) {
    const nodes = graphData
      .map(l => l.nodes)
      .reduce((sum, nodes) => sum.concat(nodes), [])
    return markFamilyWithTarget(nodes, target)
  }

  setLayers(graphData, foundTarget) {
    this.layers = []
    let layerNum = 1
    for (const layer of graphData) {
      this.layers.push(new DepGraphLayer(layerNum, layer, foundTarget))
      layerNum += 1
    }
  }

  toData() {
    return this.layers.map(layer => layer.toData())
  }
}
