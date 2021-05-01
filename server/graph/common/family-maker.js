/**
 * @file Definition of family-maker.
 */

import RelationMakerBase from './relation-maker-base'

/**
 * Relationship of family.
 */
class FamilyRelation {
  /**
   * @param {string}relationship - Relationship.
   * @param {number} degree - Degree.
   */
  constructor(relationship, degree) {
    /**
     * Relationship: parents - target - children
     * @type {string}
     */
    this.relation = relationship
    /**
     * Degree:
     *     ...parents(2) - parents(1) - target(0) - children(1) - children(2)...
     * @type {number}
     */
    this.degree = degree
  }

  /**
   * Convert to string.
   * @returns {string} String expression of this object.
   */
  toString() {
    return `{ relation: ${this.relation}, degree: ${this.degree} }`
  }
}

/**
 * Make family relation attribute for recursive structures (nodes).
 */
class FamilyMaker extends RelationMakerBase {
  /**
   * Find node by path.
   * @param {string} path - Path of target node.
   * @returns {FSNode} Found node.
   * @private
   */
  _findNodeByPath(path) {
    return this.nodes.find((d) => d.path === path)
  }

  /**
   * Check node has 'family' attribute.
   * @param {FSNode} node - Node
   * @returns {boolean} True family exists.
   * @private
   */
  _existsFamilyInNode(node) {
    return node.family && Object.keys(node.family).length > 0
  }

  /**
   * Find node and mark it as family.
   * @param {string} path - Path of target node.
   * @param {string} relationship - Family relation.
   * @param {number} depth - Order of recursion.
   * @private
   */
  _findAndMarkAsFamily(path, relationship, depth) {
    this.consoleDebug(depth, 'findAndMark', `FIND ${path} with ${relationship}`)
    const node = this._findNodeByPath(path)
    if (!node) {
      this.consoleDebug(depth, 'findAndMark', `node ${path} not found`)
      console.log(`    `)
      return
    }
    this.consoleDebug(
      depth,
      'findAndMark',
      `mark ${node.path} as ${relationship}`
    )

    // No need to update family if the node has family
    // and its degree is lower than current depth.
    if (!(this._existsFamilyInNode(node) && node.family.degree < depth)) {
      /** @type {FamilyRelation} */
      node.family = new FamilyRelation(relationship, depth)
    }

    // Find recursively: node.parents or node.children
    for (const familyPath of node[relationship]) {
      this.consoleDebug(
        depth,
        'findAndMark',
        `next: ${familyPath} as ${relationship} of ${node.path}`
      )
      this._findAndMarkAsFamily(familyPath, relationship, depth + 1)
    }
  }

  /**
   * Mark family relation of target node.
   * @param {string} targetNodeName - Name of target node.
   * @param {string} [targetNodeLayer] - Layer of target node.
   * @returns {boolean} True if found target and marked other nodes.
   */
  markFamilyWithTarget(targetNodeName, targetNodeLayer) {
    this.consoleDebug(0, 'markTarget', 'START')

    const targetNode = this.findTargetNode(targetNodeName, targetNodeLayer)
    if (!targetNode) {
      this.consoleDebug(
        0,
        'markTarget',
        `target: ${targetNodeName} (in layer: ${targetNodeLayer}) not found`
      )
      return false
    }

    this.consoleDebug(
      0,
      'markTarget',
      `target: ${targetNode.path} found name as ${targetNodeName}`
    )

    this.consoleDebug(0, 'markTarget', `find and mark as parents`)
    this._findAndMarkAsFamily(targetNode.path, 'parents', 0)
    this.consoleDebug(0, 'markTarget', `find and mark as children`)
    this._findAndMarkAsFamily(targetNode.path, 'children', 0)

    /** @type {FamilyRelation} */
    targetNode.family = new FamilyRelation('target', 0)

    this.consoleDebug(
      0,
      'markTarget',
      `target: ${targetNode.path} mark as ${targetNode.family.relation}`
    )
    return true
  }
}

/**
 * @typedef {ForceSimulationNode|NestedNode|DistanceNode} FSNode
 * ForceSimulationNode or its child class.
 */
/**
 * Function to mark family relations.
 * @param {Array<FSNode>} nodes - Nodes.
 * @param {string} targetNodeName - Name of target node.
 * @param {string} [targetNodeLayer] - Layer of target node.
 * @returns {boolean} True if found target and marked other nodes.
 */
const markFamilyWithTarget = (nodes, targetNodeName, targetNodeLayer) => {
  const familyMaker = new FamilyMaker(nodes)
  // append 'family' attribute directly
  return familyMaker.markFamilyWithTarget(targetNodeName, targetNodeLayer)
}

export default markFamilyWithTarget
