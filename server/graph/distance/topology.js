/**
 * @file Definition of distance graph
 */

import markNeighborWithTarget from '../common/neighbor-maker'
import markFamilyWithTarget from '../common/family-maker'
import DistanceNode from './node'
import DistanceLink from './link'

/**
 * Distance graph.
 */
class DistanceTopology {
  /**
   * @param {DistanceGraphQuery} graphQuery - Graph query parameters.
   */
  constructor(graphQuery) {
    const networks = graphQuery.topologyData
    /** @type {Array<DistanceNode>} */
    this.nodes = this._correctArrays(networks, 'nodes').map(
      d => new DistanceNode(d)
    )
    /** @type {Array<DistanceLink>} */
    this.links = this._correctArrays(networks, 'links').map(
      d => new DistanceLink(d)
    )

    /**
     * Radius of node circle.
     * @const {number}
     */
    this.nodeRadius = 20 // pt

    const target = graphQuery.target
    const layer = graphQuery.layer
    markFamilyWithTarget(this.nodes, target, layer) // it marks tp-type node.
    markNeighborWithTarget(this.nodes, this.links, target, layer)
  }

  /**
   * Radius of distance circle
   * @param {number} degree - Distance degree.
   * @returns {number} Radius.
   * @private
   */
  _distanceCircleInterval(degree) {
    const k = degree <= 1 ? 3.5 : 3 // min: *2
    return k * this.nodeRadius
  }

  /**
   * Correct nodes/links from each network(layer).
   * @param {ForceSimulationTopologyData} networks - Networks.
   * @param {string} attribute - nodes or links
   * @returns {Array<ForceSimulationNodeData>|Array<ForceSimulationLinkData>} Collected array.
   * @private
   */
  _correctArrays(networks, attribute) {
    return networks
      .map(nw => nw[attribute])
      .reduce((sum, arr) => sum.concat(arr), [])
  }

  /**
   * Calculate radius of distance-circle.
   * @param {number} dIndex - distance index (degree).
   * @param {Array<DistanceNodeLayoutData>} layouts - Layout data.
   * @param {number} count - Number of nodes have same distance degree.
   * @returns {number} - Radius of distance-circle.
   * @private
   */
  _distanceCircleRadius(dIndex, layouts, count) {
    if (dIndex === 0) {
      return 0
    }

    const distanceBefore = layouts[dIndex - 1].r
    const diR = distanceBefore + this._distanceCircleInterval(dIndex)
    if (count <= 2) {
      return diR // when 1 or 2 nodes
    }

    const theta = (2 * Math.PI) / count
    return diR * Math.sin(theta / 2) < this.nodeRadius
      ? this.nodeRadius / Math.sin(theta / 2)
      : diR
  }

  /**
   * Make layout for distance diagram.
   * @returns {Array<DistanceNodeLayoutData>}
   * @private
   */
  _makeNodeLayout() {
    const nodes = this.nodes.filter(
      // markFamily marked tp-type node. filter it.
      d => d.hasTargetRelation() && d.isTypeNode()
    )
    const maxDistance = Math.max(...nodes.map(d => d.distance()))
    const layouts = []
    const round = value => {
      const k = 1000
      return Math.floor(value * k) / k
    }

    for (let di = 0; di <= maxDistance; di++) {
      const diNodes = nodes.filter(d => d.distance() === di)
      const count = diNodes.length
      const diR = this._distanceCircleRadius(di, layouts, count)
      /**
       * @typedef {Object} DistanceNodeLayoutData
       * @prop {number} dIndex - Distance index.
       * @prop {number} r - Radius of distance circle.
       * @prop {DistanceNode} nodes - Nodes at the distance
       */
      layouts.push({ dIndex: di, nodes: diNodes, r: diR })

      const startAngle =
        Math.PI / 4 + ((di - 1) * Math.PI) / 2 / (maxDistance - 1)
      diNodes.forEach((d, i) => {
        d.di = i
        d.r = round(this.nodeRadius)
        const theta = (2 * Math.PI) / count
        const angle = theta * i - startAngle
        d.cx = round(diR * Math.cos(angle))
        d.cy = round(diR * Math.sin(angle))
      })
    }
    return layouts
  }

  /**
   * Pick nodes in each layout data.
   * @param {Array<DistanceNodeLayoutData>} layouts - Layouts.
   * @returns {Array<DistanceNode>} Nodes.
   * @private
   */
  _nodesInLayouts(layouts) {
    return layouts
      .map(layout => layout.nodes)
      .reduce((sum, n) => sum.concat(n), [])
  }

  /**
   * Make links of supporting-nodes relation.
   * @param {Array<DistanceNodeLayoutData>} layouts - Layouts.
   * @returns {Array<DistanceLinkData>} Links.
   * @private
   */
  _makeSupportLinks(layouts) {
    const nodes = this._nodesInLayouts(layouts)
    const links = []

    for (const node of nodes) {
      for (const supportPath of node.children) {
        if (!nodes.find(d => d.path === supportPath)) {
          continue
        }
        const supportName = supportPath.split('__').slice(1)
        const supportLayer = supportPath.split('__').shift()
        const name = `${node.name},${supportName}`
        const linkData = {
          name,
          path: `${node.layerPath()},${supportLayer}__${name}`,
          type: 'support-node',
          sourceNodePath: node.path,
          targetNodePath: supportPath
        }
        links.push(linkData)
      }
    }
    return links
  }

  /**
   * Make links inter nodes.
   * @param {Array<DistanceNodeLayoutData>} layouts - Layouts.
   * @returns {Array<DistanceLink>} - Links.
   * @private
   */
  _makeLinks(layouts) {
    const nodes = this._nodesInLayouts(layouts)
    const baseLinks = this.links.filter(d => d.isTypeTpTp())
    const links = []

    for (const srcNode of nodes) {
      const linksFromSrcNode = baseLinks.filter(
        l => l.sourceNodePath === srcNode.path
      )
      for (const linkFromSrcNode of linksFromSrcNode) {
        if (
          nodes.find(d => d.path === linkFromSrcNode.targetNodePath) &&
          // limit single side (one of bi-directional link)
          !links.find(l => l.isReverseLink(linkFromSrcNode))
        ) {
          links.push(linkFromSrcNode)
        }
      }
    }
    return links
  }

  /**
   * Convert to dependency graph data.
   * @returns {DistanceTopologyData}
   * @public
   */
  toData() {
    /**
     * @typedef {Object} DistanceTopologyData
     * @prop {Array<DistanceNodeLayoutData>} layouts - Distance-Nodes table.
     * @prop {Array<DistanceLink>} links - Links.
     * @prop {Array<DistanceLink>} supportLinks - Support-node links.
     */
    const layouts = this._makeNodeLayout()
    return {
      layouts,
      supportLinks: this._makeSupportLinks(layouts),
      links: this._makeLinks(layouts)
    }
  }
}

export default DistanceTopology
