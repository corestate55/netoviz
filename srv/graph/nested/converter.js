import NestedGraph from './graph'

export default class NestedGraphConverter {
  constructor (graphData, layoutData, reverse) {
    this.nestedGraph = new NestedGraph(graphData, layoutData, reverse)
  }

  toData () {
    return this.nestedGraph.toData()
  }
}

// const jsonPath = 'dist/target3b.json.cache'
// const graphData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
// const nestedGraph = new NestedGraph(graphData)
// const resJsonString = JSON.stringify(nestedGraph.toData())
// console.log(resJsonString)
