import DeepNestedGraph from './deep-graph'

const convertNestedGraphData = graphQuery => {
  const nestedGraph = new DeepNestedGraph(graphQuery)
  nestedGraph.initialize()
  return nestedGraph.toData()
}

export default convertNestedGraphData
