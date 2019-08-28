class FamilyRelation {
  constructor (relationship, degree) {
    this.relation = relationship
    this.degree = degree
  }

  toString () {
    return `{ relation: ${this.relation}, degree: ${this.degree} }`
  }
}

class FamilyMaker {
  constructor (nodes) {
    this.debugCalc = false
    this.nodes = nodes
  }

  _consoleDebug (order, pos, message, value) {
    if (!this.debugCalc) {
      return
    }
    if (typeof value === 'undefined') {
      value = ''
    }
    const indent = ' '.repeat(order)
    console.log(`[${order}]${indent} * [${pos}] ${message}`, value)
  }

  findNodeByPath (path) {
    return this.nodes.find(d => d.path === path)
  }

  findAndMarkAsFamily (path, relationship, depth) {
    this._consoleDebug(
      depth,
      'findAndMark',
      `FIND ${path} with ${relationship}`
    )
    const node = this.findNodeByPath(path)
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
    node.family = new FamilyRelation(relationship, depth)
    // Find recursively: node.parents or node.children
    for (const familyPath of node[relationship]) {
      this._consoleDebug(
        depth,
        'findAndMark',
        `next: ${familyPath} as ${relationship} of ${node.path}`
      )
      this.findAndMarkAsFamily(familyPath, relationship, depth + 1)
    }
  }

  findTargetNodeByName (name) {
    return this.nodes.reverse().find(d => d.type === 'node' && d.name === name)
  }

  findTargetNodeByPath (path) {
    return this.nodes.find(d => d.path === path)
  }

  findTargetNode (targetNodeName, targetNodeLayer) {
    this._consoleDebug(
      1,
      'findTargetNode',
      `Search ${targetNodeLayer}__${targetNodeName}`
    )
    if (targetNodeLayer) {
      return this.findTargetNodeByPath(`${targetNodeLayer}__${targetNodeName}`)
    } else {
      return this.findTargetNodeByName(targetNodeName)
    }
  }

  markFamilyWithTarget (targetNodeName, targetNodeLayer) {
    this._consoleDebug(0, 'markTarget', 'START')
    const targetNode = this.findTargetNode(targetNodeName, targetNodeLayer)
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
    this.findAndMarkAsFamily(targetNode.path, 'parents', 1)
    this._consoleDebug(0, 'markTarget', `find and mark as children`)
    this.findAndMarkAsFamily(targetNode.path, 'children', 1)
    targetNode.family = 'target'
    this._consoleDebug(
      0,
      'markTarget',
      `target: ${targetNode.path} mark as ${targetNode.family}`
    )
    return true
  }
}

const markFamilyWithTarget = (nodes, targetNodeName, targetNodeLayer) => {
  const familyMaker = new FamilyMaker(nodes)
  // append 'family' attribute directly
  return familyMaker.markFamilyWithTarget(targetNodeName, targetNodeLayer)
}

export default markFamilyWithTarget
