import ShallowNestedGraphNode from './shallow-node'

export default class DeepNestedGraphNode extends ShallowNestedGraphNode {
  constructor (nodeData, reverse) {
    super(nodeData, reverse)
    this.split = 0
  }

  renameChildPath (oldChildPath, newChildPath) {
    // operation for parent node of multiple-parents node
    // (change child info)
    this.children = this.children
      .filter(d => d !== oldChildPath)
      .concat(newChildPath)
  }

  splitByParent (parentPath) {
    // operation for child node which has multiple-parents
    // (copy and change parents info)
    const splitNode = new DeepNestedGraphNode(this)
    splitNode.path = `${this.path}::${this.split}`
    // overwrite children and parents (selected by reverse flag in constructor)
    splitNode.children = this.children
    splitNode.parents = [ parentPath ]
    // delete and ignore tp path
    this.parents = this.parentNodePaths().filter(d => d !== parentPath)
    splitNode.split++
    this.split++

    return splitNode
  }
}
