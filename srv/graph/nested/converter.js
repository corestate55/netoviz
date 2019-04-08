import ShallowNestedGraph from './shallow-graph'
import DeepNestedGraph from './deep-graph'

export default class NestedGraphConverter {
  constructor (graphData, layoutData, reverse, deep) {
    if (deep) {
      this.nestedGraph = new DeepNestedGraph(graphData, layoutData, reverse)
    } else {
      this.nestedGraph = new ShallowNestedGraph(graphData, layoutData, reverse)
    }
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
