import DeepNestedGraph from './deep-graph'

class NestedGraphConverter {
  constructor (graphData, layoutData, reverse, depth, target) {
    this.nestedGraph = new DeepNestedGraph(
      graphData,
      layoutData,
      reverse,
      depth,
      target
    )
    this.nestedGraph.initialize()
  }

  toData () {
    return this.nestedGraph.toData()
  }
}

const convertNestedGraphData = async (
  reverse,
  depth,
  target,
  topoGraphDataCB,
  layoutDataCB
) => {
  const nestedGraphConverter = new NestedGraphConverter(
    await topoGraphDataCB(),
    await layoutDataCB(),
    reverse,
    depth,
    target
  )
  return nestedGraphConverter.toData()
}

export default convertNestedGraphData
