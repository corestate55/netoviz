/**
 * @file Definition of family-maker.
 */

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
class FamilyMaker {
  /**
   * @param {Array<FSNode>} nodes - nodes which have parents/children.
   */
  constructor(nodes) {
    /** @type {boolean} */
    this.debugCalc = false
    /** @type {Array<FSNode>} */
    this.nodes = nodes
  }

  /**
   * Debug print for recursive operation.
   * @param {number} order - Order of recursive.
   * @param {string} pos - Position.
   * @param {string} message - Debug message.
   * @param {Object} [value] - Value to print.
   * @private
   */
  _consoleDebug(order, pos, message, value) {
    if (!this.debugCalc) {
      return
    }
    if (typeof value === 'undefined') {
      value = ''
    }
    const indent = ' '.repeat(order)
    console.log(`[${order}]${indent} * [${pos}] ${message}`, value)
  }

  /**
   * Find node by path.
   * @param {string} path - Path of target node.
   * @returns {FSNode} Found node.
   * @private
   */
  _findNodeByPath(path) {
    return this.nodes.find(d => d.path === path)
  }

  /**
   * Find node and mark it as family.
   * @param {string} path - Path of target node.
   * @param {string} relationship - Family relation.
   * @param {number} depth - Order of recursion.
   * @private
   */
  _findAndMarkAsFamily(path, relationship, depth) {
    this._consoleDebug(
      depth,
      'findAndMark',
      `FIND ${path} with ${relationship}`
    )
    const node = this._findNodeByPath(path)
    if (!node) {
      this._consoleDebug(depth, 'findAndMark', `node ${path} not found`)
      console.log(`    `)
      return
    }
    this._consoleDebug(
      depth,
      'findAndMark',
      `mark ${node.path} as ${relationship}`
    )

    /** @type {FamilyRelation} */
    node.family = new FamilyRelation(relationship, depth)

    // Find recursively: node.parents or node.children
    for (const familyPath of node[relationship]) {
      this._consoleDebug(
        depth,
        'findAndMark',
        `next: ${familyPath} as ${relationship} of ${node.path}`
      )
      this._findAndMarkAsFamily(familyPath, relationship, depth + 1)
    }
  }

  /**
   * Find node with its name.
   * @param {string} name - Name of target node.
   * @returns {FSNode} Found node.
   * @private
   */
  _findTargetNodeByName(name) {
    return this.nodes.reverse().find(d => d.type === 'node' && d.name === name)
  }

  /**
   * Find node with its path.
   * @param {string} path - path of target node.
   * @returns {FSNode} Found node.
   * @private
   */
  _findTargetNodeByPath(path) {
    return this.nodes.find(d => d.path === path)
  }

  /**
   * Find node with its layer and name.
   * @param {string} targetNodeName - Name of target node.
   * @param {string} [targetNodeLayer] - Layer of target node.
   * @returns {FSNode} Found node.
   * @private
   */
  _findTargetNode(targetNodeName, targetNodeLayer) {
    this._consoleDebug(
      1,
      '_findTargetNode',
      `Search ${targetNodeLayer}__${targetNodeName}`
    )
    if (targetNodeLayer) {
      return this._findTargetNodeByPath(`${targetNodeLayer}__${targetNodeName}`)
    } else {
      return this._findTargetNodeByName(targetNodeName)
    }
  }

  /**
   * Mark family relation of target node.
   * @param {string} targetNodeName - Name of target node.
   * @param {string} [targetNodeLayer] - Layer of target node.
   * @returns {boolean} True if found target and marked other nodes.
   */
  markFamilyWithTarget(targetNodeName, targetNodeLayer) {
    this._consoleDebug(0, 'markTarget', 'START')

    const targetNode = this._findTargetNode(targetNodeName, targetNodeLayer)
    if (!targetNode) {
      this._consoleDebug(
        0,
        'markTarget',
        `target: ${targetNodeName} (in layer: ${targetNodeLayer}) not found`
      )
      return false
    }

    this._consoleDebug(
      0,
      'markTarget',
      `target: ${targetNode.path} found name as ${targetNodeName}`
    )

    this._consoleDebug(0, 'markTarget', `find and mark as parents`)
    this._findAndMarkAsFamily(targetNode.path, 'parents', 1)
    this._consoleDebug(0, 'markTarget', `find and mark as children`)
    this._findAndMarkAsFamily(targetNode.path, 'children', 1)

    /** @type {FamilyRelation} */
    targetNode.family = new FamilyRelation('target', 0)

    this._consoleDebug(
      0,
      'markTarget',
      `target: ${targetNode.path} mark as ${targetNode.family.relation}`
    )
    return true
  }
}

/**
 * @typedef {ForceSimulationNode|NestedNode} FSNode
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
