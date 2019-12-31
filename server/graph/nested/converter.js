import DeepNestedGraph from './deep-graph'
import AggregatedGraph from './aggregate-graph'

const convertNestedGraphData = graphQuery => {
  const nestedGraph = graphQuery.aggregate
    ? new AggregatedGraph(graphQuery)
    : new DeepNestedGraph(graphQuery)
  nestedGraph.initialize()
  return nestedGraph.toData()
}

export default convertNestedGraphData
