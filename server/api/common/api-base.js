import fs from 'fs'
import { promisify } from 'util'
import CacheRfcTopologyDataConverter from './cache-topo-graph-converter'

const asyncReadFile = promisify(fs.readFile)

/**
 * Base class for Server-side API.
 */
class APIBase {
  /**
   * @param {string} distDir - Directory path of distributed resources.
   */
  constructor(distDir) {
    /**
     * Directory path of model files
     * @type{string}
     * @protected
     */
    this.modelDir = `${distDir}/model`
    /**
     * Topology data converter with data cache function.
     * @type {CacheRfcTopologyDataConverter}
     * @protected
     */
    this.converter = new CacheRfcTopologyDataConverter(this.modelDir, distDir)
  }

  /**
   * Get all model file information
   * @see static/model/_index.json
   * @returns {Promise<null|Object>} - Model file indexes (`_index.json`)
   * @public
   */
  async getModels() {
    const modelsFile = `${this.modelDir}/_index.json`
    try {
      const buffer = await asyncReadFile(modelsFile)
      return JSON.parse(buffer.toString())
    } catch (error) {
      console.log(error)
      return null
    }
  }

  /**
   * Read graph layout data from layout file.
   * @param {string} jsonName - File name of layout file (json).
   * @returns {Promise<null|LayoutData>} Layout data.
   * @protected
   */
  async readLayoutJSON(jsonName) {
    try {
      const baseName = jsonName.split('.').shift()
      const layoutJsonName = `${this.modelDir}/${baseName}-layout.json`
      const buffer = await asyncReadFile(layoutJsonName)
      return JSON.parse(buffer.toString())
    } catch (error) {
      console.log(`Layout file correspond with ${jsonName} was not found.`)
      // layout file is optional.
      // when found (layout file was not found), use default layout.
      return null
    }
  }

  /**
   * Convert rfc-topology data to topology data to draw diagram.
   * @param {string} jsonName - File name of rfc-topology data.
   * @returns {Promise<ForceSimulationTopologyData>} topology data for force-simulation diagram.
   * @protected
   */
  toForceSimulationTopologyData(jsonName) {
    return this.converter.toForceSimulationTopologyData(jsonName)
  }

  /**
   * Convert rfc-topology data to topology data for dependency diagram.
   * @param {string} jsonName - file name of rfc-topology data.
   * @param {Request|proto.netoviz.GraphRequest} req - HTTP/gRPC request.
   * @returns {Promise<DependencyTopologyData>} Graph data object for nested graph.
   * @abstract
   * @protected
   */
  async toDependencyTopologyData(jsonName, req) {
    /**
     * @typedef {Object} DependencyGraphQuery
     * @prop {string} target
     * @prop {ForceSimulationTopologyData} topologyData
     */
  }

  /**
   * Convert rfc-topology data to topology data for nested diagram.
   * @param {string} jsonName - file name of rfc-topology data.
   * @param {Request|proto.netoviz.GraphRequest} req - HTTP/gRPC request.
   * @returns {Promise<NestedTopologyData>} Graph data object for nested graph.
   * @abstract
   * @protected
   */
  async toNestedTopologyData(jsonName, req) {
    /**
     * @typedef {Object} NestedGraphQuery
     * @prop {boolean} reverse
     * @prop {number} depth
     * @prop {string} target
     * @prop {string} layer
     * @prop {boolean} aggregate
     * @prop {ForceSimulationTopologyData} topologyData
     * @prop {LayoutData} layoutData
     */
  }

  /**
   * Convert rfc-topology data to topology data for distance diagram.
   * @param {string} jsonName - file name of rfc-topology data.
   * @param {Request|proto.netoviz.GraphRequest} req - HTTP/gRPC request.
   * @returns {Promise<DistanceTopologyData>} Graph data object for distance graph.
   * @abstract
   * @protected
   */
  async toDistanceTopologyData(jsonName, req) {
    /**
     * @typedef {Object} DistanceGraphQuery
     * @prop {string} target
     * @prop {string} layer
     * @prop {ForceSimulationTopologyData} topologyData
     */
  }

  /**
   * Get converted graph data for web-frontend visualization.
   * @param {Request|proto.netoviz.GraphRequest} req - HTTP/gRPC request.
   * @returns {Promise<string>} Graph data as JSON format string.
   * @public
   */
  async getGraphData(req) {
    const graphName = req?.params?.graphName || req.getGraphType()
    const jsonName = req?.params?.jsonName || req.getJsonName()

    if (graphName === 'forceSimulation') {
      return JSON.stringify(await this.toForceSimulationTopologyData(jsonName))
    } else if (graphName === 'dependency') {
      return JSON.stringify(await this.toDependencyTopologyData(jsonName, req))
    } else if (graphName === 'nested') {
      return JSON.stringify(await this.toNestedTopologyData(jsonName, req))
    } else if (graphName === 'distance') {
      return JSON.stringify(await this.toDistanceTopologyData(jsonName, req))
    }
    return JSON.stringify({}) // invalid graph name
  }
}

export default APIBase
