/**
 * @file API implementation of netoviz HTTP server.
 */
/**
 * Express (web framework) HTTP Request.
 * @typedef {Object} Request
 * @prop {Object} query - Dictionary of HTTP GET parameters (key-value).
 * @prop {Object} params - Dictionary of named route parameters (key-value).
 *     {@see server/api.js}
 */

import fs from 'fs'
import { promisify } from 'util'
import toDependencyTopologyData from '../graph/dependency/converter'
import toNestedTopologyData from '../graph/nested/converter'
import CacheRfcTopologyDataConverter from './cache-topo-graph-converter'

const readFile = promisify(fs.readFile)

/**
 * Class of API for topology data converter.
 */
class TopologyDataAPI {
  /**
   * @param {string} distDir - Directory path of distributed resources.
   */
  constructor(distDir) {
    /**
     * Directory path of model files
     * @type{string}
     * @private
     */
    this.modelDir = `${distDir}/model`
    /**
     * Topology data converter with data cache function.
     * @type {CacheRfcTopologyDataConverter}
     * @private
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
      const buffer = await readFile(modelsFile, 'utf-8')
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
   * @private
   */
  async _readLayoutJSON(jsonName) {
    try {
      const baseName = jsonName.split('.').shift()
      const layoutJsonName = `${this.modelDir}/${baseName}-layout.json`
      const buffer = await readFile(layoutJsonName, 'utf-8')
      return JSON.parse(buffer.toString())
    } catch (error) {
      console.log(`Layout file correspond with ${jsonName} was not found.`)
      // layout file is optional.
      // when found (layout file was not found), use default layout.
      return null
    }
  }

  /**
   * Convert topology data to graph data for topology graph.
   * @param {string} jsonName - File name of topology data.
   * @returns {Promise<ForceSimulationTopologyData>} Graph data object for topology graph.
   * @private
   */
  _toForceSimulationTopologyData(jsonName) {
    return this.converter.toForceSimulationTopologyData(jsonName)
  }

  /**
   * Convert boolean string ('true', 'false') to value (`true`/`false`).
   * @param {string} strBool - String of a boolean value.
   * @returns {boolean} Boolean value.
   * @private
   */
  _boolString2Bool(strBool) {
    if (!strBool) {
      return false
    }
    return strBool.toLowerCase() === 'true'
  }

  /**
   * Convert integer string to integer value.
   * @param {string} strNum - Strong of a integer value.
   * @returns {number} Integer value.
   * @private
   */
  _numberString2Number(strNum) {
    if (!strNum) {
      return 1
    }
    return Number(strNum)
  }

  /**
   * Construct graph query string (GET parameter of URI).
   *
   * @param {string} graphType - Type of graph (topology, dependency, nested)
   * @param {Object} query - HTTP get parameter (key-value)
   * @param {Array<Array<string>>} keys - Array of [key, type] for query.
   * @returns {GraphQuery} Dictionary of get parameters.
   * @private
   */
  _makeGraphQuery(graphType, query, keys) {
    /**
     * @typedef {NestedGraphQuery|DependencyGraphQuery} GraphQuery
     * Key-value dictionary.
     */
    const graphQuery = {}
    for (const [key, keyType] of keys) {
      if (keyType === 'number') {
        graphQuery[key] = this._numberString2Number(query[key])
      } else if (keyType === 'bool') {
        graphQuery[key] = this._boolString2Bool(query[key])
      } else {
        // string
        graphQuery[key] = query[key]
      }
    }
    const paramString = Object.entries(graphQuery)
      .map(([key, value]) => `${key}=${value}`)
      .join(', ')
    console.log(`call ${graphType}: ${paramString}`)
    return graphQuery
  }

  /**
   * Convert topology data to graph data for dependency graph.
   * @param {string} jsonName - File name of topology data.
   * @param {Request} req - HTTP request.
   * @returns {Promise<DependencyTopologyData>} Graph data object for dependency graph.
   * @private
   */
  async _toDependencyTopologyData(jsonName, req) {
    /**
     * @typedef {Object} DependencyGraphQuery
     * @prop {string} target
     * @prop {ForceSimulationTopologyData} topologyData
     */
    const queryKeyTypeList = [['target', 'string']]
    const graphQuery = /** @type {DependencyGraphQuery} */ this._makeGraphQuery(
      'dependency',
      req.query,
      queryKeyTypeList
    )
    graphQuery.topologyData = await this._toForceSimulationTopologyData(
      jsonName
    )
    return toDependencyTopologyData(graphQuery)
  }

  /**
   * Convert topology data to graph data for nested graph.
   * @param {string} jsonName - file name of topology data.
   * @param {Request} req - HTTP request.
   * @returns {Promise<NestedTopologyData>} Graph data object for nested graph.
   * @private
   */
  async _toNestedTopologyData(jsonName, req) {
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
    const queryKeyTypeList = [
      ['reverse', 'bool'],
      ['depth', 'number'],
      ['target', 'string'],
      ['layer', 'string'],
      ['aggregate', 'bool']
    ]
    const graphQuery = /** @type {NestedGraphQuery} */ this._makeGraphQuery(
      'nested',
      req.query,
      queryKeyTypeList
    )
    graphQuery.topologyData = await this._toForceSimulationTopologyData(
      jsonName
    )
    graphQuery.layoutData = await this._readLayoutJSON(jsonName)
    return toNestedTopologyData(graphQuery)
  }

  /**
   * Get converted graph data for web-frontend visualization
   * according to `graphName` parameter in API URI.
   * @param {Request} req - HTTP request.
   * @returns {Promise<string>} Graph data as JSON format string.
   * @public
   */
  async getGraphData(req) {
    const graphName = req.params.graphName
    const jsonName = req.params.jsonName

    if (graphName === 'topology') {
      return JSON.stringify(await this._toForceSimulationTopologyData(jsonName))
    } else if (graphName === 'dependency') {
      return JSON.stringify(await this._toDependencyTopologyData(jsonName, req))
    } else if (graphName === 'nested') {
      return JSON.stringify(await this._toNestedTopologyData(jsonName, req))
    }
  }

  /**
   * Receive graph layout data and save it to layout-file.
   * @param {Request} req - HTTP request.
   * @returns {Promise<void>}
   * @public
   */
  async postGraphData(req) {
    const layoutData = req.body
    const graphName = req.params.graphName // TODO: 404 if graphName != nested
    const jsonName = req.params.jsonName
    const reverse = this._boolString2Bool(req.query.reverse)

    const layoutJsonName = `${jsonName.split('.').shift()}-layout.json`
    const layoutJsonPath = `${this.modelDir}/${layoutJsonName}`
    const cacheLayoutJsonPath = layoutJsonPath // overwrite

    console.log(
      `receive ${graphName}/${jsonName}?reverse=${reverse}): `,
      layoutData
    )
    const buffer = await readFile(layoutJsonPath, 'utf8')
    const baseLayoutData = JSON.parse(buffer.toString())
    const reverseKey = reverse ? 'reverse' : 'standard'
    baseLayoutData[reverseKey].grid = layoutData
    const layoutDataString = JSON.stringify(baseLayoutData, null, 2) // pretty print
    fs.writeFile(cacheLayoutJsonPath, layoutDataString, 'utf8', error => {
      if (error) {
        throw error
      }
      console.log(`layout cache saved: ${cacheLayoutJsonPath}`)
    })
  }
}

export default TopologyDataAPI
