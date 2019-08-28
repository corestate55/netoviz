import DeepNestedGraph from './deep-graph'

class NestedGraphConverter {
  constructor (graphData, layoutData, reverse, depth, target, layer) {
    this.nestedGraph = new DeepNestedGraph(
      graphData,
      layoutData,
      reverse,
      depth,
      target,
      layer
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
  layer,
  topoGraphDataCB,
  layoutDataCB
) => {
  const nestedGraphConverter = new NestedGraphConverter(
    await topoGraphDataCB(),
    await layoutDataCB(),
    reverse,
    depth,
    target,
    layer
  )
  return nestedGraphConverter.toData()
}

export default convertNestedGraphData
