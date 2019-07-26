import ShallowNestedGraph from './shallow-graph'
import DeepNestedGraph from './deep-graph'

class NestedGraphConverter {
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

const convertNestedGraphData = async (reverse, deep, topoGraphDataCB, layoutDataCB) => {
  const topoJsonString = await topoGraphDataCB()
  const layoutJsonString = await layoutDataCB()
  const nestedGraphConverter = new NestedGraphConverter(
    JSON.parse(topoJsonString), JSON.parse(layoutJsonString),
    reverse, deep
  )
  return JSON.stringify(nestedGraphConverter.toData())
}

export default convertNestedGraphData
