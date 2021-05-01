/**
 * @file Definition of network and supporting-network class of topology model.
 */

import RfcModelBase from './base'
import RfcNode from './node'
import RfcLink from './link'

/**
 * @typedef {RfcNode|RfcL2Node|RfcL3Node|OpsNode} AllRfcNode
 */
/**
 * @typedef {RfcLink|RfcL2Link|RfcL3Link|OpsLink} AllRfcLink
 */

/**
 * Supporting network of topology model.
 * @extends {RfcModelBase}
 */
class RfcSupportingNetwork extends RfcModelBase {
  /**
   * @typedef {Object} RfcSupportingNetworkData
   * @prop {string} network-ref Network name.
   */
  /**
   * @param {RfcSupportingNetworkData} data - Data of supporting network.
   */
  constructor(data) {
    super(data)
    /** @type {string} */
    this.networkRef = data['network-ref']
    /** @type {string} */
    this.refPath = this.networkRef
  }
}

/**
 * Network-types of topology model.
 * @extends {RfcModelBase}
 */
class RfcNetworkTypes extends RfcModelBase {
  /**
   * @typedef {Object} RfcNetworkTypes
   */
  /**
   * @param {RfcNetworkTypes} data
   */
  constructor(data) {
    super(data)
    /** @type{RfcNetworkTypes} */
    this.data = data
    /** @type {Array<string>} */
    this.types = this._makeTypes(this.data)
  }

  /**
   * Make network types (keys).
   * @param {RfcNetworkTypes} data - Data of network types.
   * @returns {Array<string>} Network types.
   * @private
   */
  _makeTypes(data) {
    let types = []
    for (const type of Object.keys(data)) {
      types.push(type)
      types = types.concat(this._makeTypes(data[type]))
    }
    return types
  }

  /**
   * Check if network has specified network-type.
   * @param {string} type - Network-type.
   * @returns {Boolean} True if network-types includes specified type.
   * @public
   */
  hasType(type) {
    return Boolean(this.types && this.types.find((d) => d === type))
  }
}

/**
 * Network of topology model.
 * @extends {RfcModelBase}
 */
class RfcNetwork extends RfcModelBase {
  /**
   * @typedef {Object} RfcNetworkData
   * @prop {RfcNetworkTypes} network-types - Network-types.
   * @prop {string} network-id - Name of network.
   * @prop {Array<RfcNodeData>} node - Nodes.
   * @prop {Array<RfcLinkData>} link - Links.
   * @prop {Array<RfcSupportingNetworkData>} supporting-network Supporting-networks.
   */
  /**
   * @param {RfcNetworkData} data - Network data.
   * @param {number} nwNum - ID of network.
   */
  constructor(data, nwNum) {
    super(data)
    /** @type {RfcNetworkTypes} */
    this.networkTypes = new RfcNetworkTypes(data['network-types'])
    /** @type {string} */
    this.name = data['network-id'] // name string
    /** @type {number} */
    this.id = nwNum * 10000 // integer
    /** @type {string} */
    this.path = this.name
    this._constructSupportingNetworks(data)
    this._constructNodes(data)
    this._constructLinks(data)
  }

  _constructSupportingNetworks(data) {
    /** @type {Array<RfcSupportingNetwork>} */
    this.supportingNetworks = []
    if (data['supporting-network']) {
      this.supportingNetworks = data['supporting-network'].map(
        (d) => new RfcSupportingNetwork(d)
      )
    }
  }

  /**
   * Convert all `RfcNode`s to `ForceSimulationNode`s.
   * @returns {Array<ForceSimulationNode>} Node-type nodes.
   * @private
   */
  _makeGraphNodesAsNode() {
    return this.nodes.map((node) => node.graphNode())
  }

  /**
   * Convert all `RfcTermPoint`s to `ForceSimulationNode`s (tp-type node).
   * @returns {Array<ForceSimulationNode>} Tp-type nodes.
   * @private
   */
  _makeGraphNodesAsTp() {
    const tps = this.nodes.map((node) => {
      return node.termPoints.map((tp) => tp.graphNode())
    })
    return this.flatten(tps)
  }

  /**
   * Make `ForceSimulationNode`s in this network.
   * @returns {Array<ForceSimulationNode>} All node/tp-type nodes.
   * @public
   */
  makeGraphNodes() {
    const nodes = [this._makeGraphNodesAsNode(), this._makeGraphNodesAsTp()]
    return this.flatten(nodes)
  }

  /**
   * Construct nodes.
   * @param {RfcNetworkData} data - Network data.
   * @private
   */
  _constructNodes(data) {
    /** @type {Array<AllRfcNode>} */
    this.nodes = []
    if (data.node) {
      this.nodes = data.node.map((d, i) => {
        return this.newNode(d, i + 1)
      })
    }
  }

  /**
   * Create (new) node.
   * @param {RfcNodeData} data - Node data.
   * @param {number} nodeNum - ID of node.
   * @returns {RfcNode} node.
   * @protected
   */
  newNode(data, nodeNum) {
    return new RfcNode(data, this.path, this.id, nodeNum)
  }

  /**
   * Construct links.
   * @param {RfcNetworkData} data - Network data.
   * @private
   */
  _constructLinks(data) {
    /** @type {Array<AllRfcLink>} */
    this.links = []
    const linkKey = 'ietf-network-topology:link' // alias
    if (data[linkKey]) {
      this.links = data[linkKey].map((d) => {
        return this.newLink(d)
      })
    }
  }

  /**
   * Create (new) link.
   * @param {RfcLinkData} data - Link data.
   * @returns {RfcLink} RfcLink.
   * @protected
   */
  newLink(data) {
    return new RfcLink(data, this.path)
  }

  /**
   * Make `ForceSimulationLink`s in this network.
   * @returns {Array<ForceSimulationLink>} All links.
   * @public
   */
  makeGraphLinks() {
    const links = this.links.map((link) => link.graphLink())
    const linksNodeTp = this.nodes.map((node) => {
      return node.termPoints.map((tp) => tp.graphLink())
    })
    return this.flatten([links, this.flatten(linksNodeTp)])
  }

  /**
   * Check network type is L3.
   * @returns {Boolean} True if L3.
   * @public
   */
  isTypeLayer3() {
    const nwL3TypeKey = 'ietf-l3-unicast-topology:l3-unicast-topology' // alias
    return this.networkTypes.hasType(nwL3TypeKey)
  }

  /**
   * Check network type is L2.
   * @returns {Boolean} True if L2.
   * @public
   */
  isTypeLayer2() {
    const nwL2TypeKey = 'ietf-l2-topology:l2-network' // alias
    return this.networkTypes.hasType(nwL2TypeKey)
  }

  isTypeOps() {
    const nwOpsTypeKey = 'ops-topology:ops-network' // alias
    return this.networkTypes.hasType(nwOpsTypeKey)
  }
}

export default RfcNetwork
