/**
 * @file Definition of Node for deep nested graph.
 */

import ShallowNestedNode from './shallow-node'

/**
 * Node for deep nested graph. (enable node splitting)
 * @extends {ShallowNestedNode}
 * @see {DeepNestedTopology}
 */
class DeepNestedNode extends ShallowNestedNode {
  /**
   * @param {ForceSimulationNodeData|DeepNestedNode} nodeData - Node data.
   * @param {boolean} reverse - Flag for top/bottom view selection.
   */
  constructor(nodeData, reverse) {
    super(nodeData, reverse)
    /** @type {number} */
    this.split = 'split' in nodeData ? nodeData.split : 0
    /** @type {FamilyRelation|null} */
    this.family = nodeData.family || null
  }

  /**
   * Rename child path. (used for target node)
   * @param {string} oldChildPath - split target node path
   * @param {string} newChildPath - split (duplicated) node path
   * @public
   */
  renameChildPath(oldChildPath, newChildPath) {
    // operation for parent node of multiple-parents node
    // (change child info)
    this.children = this.children
      .filter((d) => d !== oldChildPath)
      .concat(newChildPath)
  }

  /**
   * Duplicate myself. (node)
   * @returns {DeepNestedNode} - A Copy of myself (simple copy)
   * @private
   */
  _duplicate() {
    this.split++
    return new DeepNestedNode(this, this.reverse)
  }

  /**
   * Split myself. (used for child node)
   * @param {string} parentPath - Path of parent.
   * @returns {DeepNestedNode} - A Copy of myself (duplicated node).
   * @public
   */
  splitNodeByParent(parentPath) {
    const splitNode = this._duplicate()
    splitNode.path = `${this.path}::${this.split}`
    // overwrite children and parents (selected by reverse flag in constructor)
    splitNode.children = this.children
    splitNode.parents = [parentPath]
    // delete and ignore tp path
    this.parents = this.parentNodePaths().filter((d) => d !== parentPath)

    return splitNode
  }
}

export default DeepNestedNode
