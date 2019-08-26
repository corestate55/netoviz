import DepGraphLayer from './layer'

class DepGraphConverter {
  constructor (graphData) {
    this.setLayers(graphData)
  }

  setLayers (graphData) {
    this.layers = []
    let layerNum = 1
    for (const layer of graphData) {
      this.layers.push(new DepGraphLayer(layerNum, layer))
      layerNum += 1
    }
  }

  toData () {
    return this.layers.map(layer => layer.toData())
  }
}

const convertDependencyGraphData = async topoGraphDataCB => {
  const topoJsonString = await topoGraphDataCB() // callback
  const depGraphConverter = new DepGraphConverter(JSON.parse(topoJsonString))
  return JSON.stringify(depGraphConverter.toData())
}

export default convertDependencyGraphData
