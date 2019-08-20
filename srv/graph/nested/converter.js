import DeepNestedGraph from './deep-graph'

class NestedGraphConverter {
  constructor (graphData, layoutData, reverse, depth) {
    this.nestedGraph = new DeepNestedGraph(graphData, layoutData, reverse, depth)
  }

  toData () {
    return this.nestedGraph.toData()
  }
}

const convertNestedGraphData = async (reverse, depth, topoGraphDataCB, layoutDataCB) => {
  const topoJsonString = await topoGraphDataCB()
  const layoutJsonString = await layoutDataCB()
  const nestedGraphConverter = new NestedGraphConverter(
    JSON.parse(topoJsonString), JSON.parse(layoutJsonString),
    reverse, depth
  )
  return JSON.stringify(nestedGraphConverter.toData())
}

export default convertNestedGraphData
