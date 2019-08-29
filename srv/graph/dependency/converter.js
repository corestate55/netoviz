import DepGraph from './graph'

const convertDependencyGraphData = graphQuery => {
  const depGraph = new DepGraph(graphQuery)
  return depGraph.toData()
}

export default convertDependencyGraphData
