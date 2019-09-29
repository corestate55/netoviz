export default class NestedGraphLink {
  constructor(linkData) {
    this.name = linkData.name
    this.path = linkData.path
    this.type = linkData.type
    this.sourcePath = linkData.sourcePath
    this.targetPath = linkData.targetPath
    this.sourceId = linkData.sourceId
    this.targetId = linkData.targetId
    this.attribute = linkData.attribute
    this.diffState = linkData.diffState
  }

  availableIn(nodes) {
    if (this.type === 'node-tp') {
      return false // do not use node-tp type link in Nested Graph
    }
    const source = nodes.find(d => d.path === this.sourcePath)
    const target = nodes.find(d => d.path === this.targetPath)
    return source && target
  }
}
