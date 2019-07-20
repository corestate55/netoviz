import DepGraphConstants from './constants'

export default class DepGraphNodeBase extends DepGraphConstants {
  constructor (graphData) {
    super()
    this.name = graphData.name
    this.path = graphData.path
    this.children = graphData.children
    this.parents = graphData.parents
    this.type = graphData.type
    this.attribute = graphData.attribute
    this.diffState = graphData.diffState || {}
  }
}
