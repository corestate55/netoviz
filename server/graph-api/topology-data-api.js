/**
 * @file API implementation of netoviz HTTP server.
 */

import fs from 'fs'
import { promisify } from 'util'
import convertDependencyGraphData from '../graph/dependency/converter'
import convertNestedGraphData from '../graph/nested/converter'
import CacheTopoGraphConverter from './cache-topo-graph-converter'

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
    this._modelDir = `${distDir}/model`
    /**
     * Topology data converter with data cache function.
     * @type {CacheTopologyGraphConverter}
     * @private
     */
    this._topoGraphConverter = new CacheTopoGraphConverter(
      this._modelDir,
      distDir
    )
  }

  /**
   * Get all model file information
   * @see static/model/_index.json
   * @returns {Promise<null|Object>} - Model file indexes (`_index.json`)
   * @public
   */
  async getModels() {
    const modelsFile = `${this._modelDir}/_index.json`
    try {
      return JSON.parse(await readFile(modelsFile, 'utf-8'))
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
      const layoutJsonName = `${this._modelDir}/${baseName}-layout.json`
      /**
       * @typedef {Object} LayoutData
       * @prop {Object} standard - Top (standard) view layout data.
       * @prop {Object} reverse - Bottom view layout data.
       */
      return JSON.parse(await readFile(layoutJsonName, 'utf-8'))
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
   * @returns {Promise<Object>} Graph data object for topology graph.
   * @private
   */
  _convertTopoGraphData(jsonName) {
    return this._topoGraphConverter.toData(jsonName)
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
   * @param {string} graphType - Type of graph (topology, dependency, nested)
   * @param {Request.query} query - HTTP get parameter (key-value)
   * @param {Array} keys - Array of [key, type] for query.
   * @returns {Object} Dictionary of get parameters.
   * @private
   */
  _makeGraphQuery(graphType, query, keys) {
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
   * @returns {Promise<Object>} Graph data object for dependency graph.
   * @private
   */
  async _getDependencyGraphData(jsonName, req) {
    const graphQuery = this._makeGraphQuery('dependency', req.query, [
      ['target', 'string']
    ])
    graphQuery.graphData = await this._convertTopoGraphData(jsonName)
    return convertDependencyGraphData(graphQuery)
  }

  /**
   * Convert topology data to graph data for nested graph.
   * @param {string} jsonName - file name of topology data.
   * @param {Request} req - HTTP request.
   * @returns {Promise<NestedGraphData>} Graph data object for nested graph.
   * @private
   */
  async _getNestedGraphData(jsonName, req) {
    /**
     * @typedef {Object} NestedGraphQuery
     * @prop {boolean} reverse - Enable reverse graph (bottom view).
     * @prop {number} depth - Maximum layer depth to display.
     * @prop {string} target - Selected node name to highlight.
     * @prop {string} layer - Layer name of selected node to highlight.
     * @prop {boolean} aggregate - Enable node aggregation.
     * @prop {TopologyGraphData} graphData - (topology) Graph data.
     * @prop {LayoutData} layoutData - Layout data.
     */
    const graphQuery = this._makeGraphQuery('nested', req.query, [
      ['reverse', 'bool'],
      ['depth', 'number'],
      ['target', 'string'],
      ['layer', 'string'],
      ['aggregate', 'bool']
    ])
    graphQuery.graphData = await this._convertTopoGraphData(jsonName)
    graphQuery.layoutData = await this._readLayoutJSON(jsonName)
    return convertNestedGraphData(graphQuery)
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
      return JSON.stringify(await this._convertTopoGraphData(jsonName))
    } else if (graphName === 'dependency') {
      return JSON.stringify(await this._getDependencyGraphData(jsonName, req))
    } else if (graphName === 'nested') {
      return JSON.stringify(await this._getNestedGraphData(jsonName, req))
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
    const layoutJsonPath = `${this._modelDir}/${layoutJsonName}`
    const cacheLayoutJsonPath = layoutJsonPath // overwrite

    console.log(
      `receive ${graphName}/${jsonName}?reverse=${reverse}): `,
      layoutData
    )
    const baseLayoutData = JSON.parse(await readFile(layoutJsonPath, 'utf8'))
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
