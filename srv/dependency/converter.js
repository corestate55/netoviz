import DepGraphLayer from './layer'

export default class DepGraphConverter {
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

// const jsonPath = 'dist/target3b.json.cache'
// const graphData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
// const depGraph = new DepGraph(graphData)
// const resJsonString = JSON.stringify(depGraph.toData())
// console.log(resJsonString)
