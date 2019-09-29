'use strict'

export default class GraphLink {
  constructor(data) {
    this.name = data.name
    this.path = data.path
    this.type = data.type
    this.sourcePath = data.sourcePath
    this.targetPath = data.targetPath
    // Link termination point ID (0 means error...)
    this.sourceId = data.sourceId || 0
    this.targetId = data.targetId || 0
    this.attribute = data.attribute || {}
    this.diffState = data.diffState || {}
  }
}
