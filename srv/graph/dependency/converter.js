import DepGraphLayer from './layer'
import markFamilyWithTarget from '../common/family-maker'

class DepGraphConverter {
  constructor (graphData, target) {
    const foundTarget = this.markFamilyWithTarget(graphData, target)
    this.setLayers(graphData, foundTarget)
  }

  markFamilyWithTarget (graphData, target) {
    const nodes = graphData
      .map(l => l.nodes)
      .reduce((sum, nodes) => sum.concat(nodes), [])
    return markFamilyWithTarget(nodes, target)
  }

  setLayers (graphData, foundTarget) {
    this.layers = []
    let layerNum = 1
    for (const layer of graphData) {
      this.layers.push(new DepGraphLayer(layerNum, layer, foundTarget))
      layerNum += 1
    }
  }

  toData () {
    return this.layers.map(layer => layer.toData())
  }
}

const convertDependencyGraphData = async (target, topoGraphDataCB) => {
  const graphData = await topoGraphDataCB() // callback
  const depGraphConverter = new DepGraphConverter(graphData, target)
  return depGraphConverter.toData()
}

export default convertDependencyGraphData
