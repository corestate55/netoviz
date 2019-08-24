import ShallowNestedGraphNode from './shallow-node'

export default class DeepNestedGraphNode extends ShallowNestedGraphNode {
  constructor (nodeData, reverse) {
    super(nodeData, reverse)
    this.split = 'split' in nodeData ? nodeData.split : 0
    this.family = nodeData.family || null
  }

  renameChildPath (oldChildPath, newChildPath) {
    // operation for parent node of multiple-parents node
    // (change child info)
    this.children = this.children
      .filter(d => d !== oldChildPath)
      .concat(newChildPath)
  }

  duplicate () {
    this.split++
    return new DeepNestedGraphNode(this)
  }

  splitNodeByParent (parentPath) {
    const splitNode = this.duplicate()
    splitNode.path = `${this.path}::${this.split}`
    // overwrite children and parents (selected by reverse flag in constructor)
    splitNode.children = this.children
    splitNode.parents = [ parentPath ]
    // delete and ignore tp path
    this.parents = this.parentNodePaths().filter(d => d !== parentPath)

    return splitNode
  }
}
