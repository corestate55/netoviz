import fs from 'fs'
import CacheTopoGraphConverter from './cache-topo-graph-converter'
import convertDependencyGraphData from '../graph/dependency/converter'
import convertNestedGraphData from '../graph/nested/converter'
import { promisify } from 'util'

const readFile = promisify(fs.readFile)

export default class TopoogyDataAPI {
  constructor (mode) {
    const prodDistDir = 'dist'
    const devDistDir = 'public'
    const distDir = mode === 'production' ? prodDistDir : devDistDir
    this.modelDir = `${distDir}/model`
    // always use prod dist dir for cache
    this.topoGraphConverter = new CacheTopoGraphConverter(
      this.modelDir,
      prodDistDir
    )
  }

  async getModels () {
    const modelsFile = `${this.modelDir}/_index.json`
    try {
      return JSON.parse(await readFile(modelsFile, 'utf-8'))
    } catch (error) {
      console.log(error)
      return []
    }
  }

  async readLayoutJSON (jsonName) {
    try {
      const baseName = jsonName.split('.').shift()
      const layoutJsonName = `${this.modelDir}/${baseName}-layout.json`
      return JSON.parse(await readFile(layoutJsonName, 'utf-8'))
    } catch (error) {
      console.log(`Layout file correspond with ${jsonName} was not found.`)
      // layout file is optional.
      // when found (layout file was not found), use default layout.
      return null
    }
  }

  async convertTopoGraphData (jsonName) {
    return this.topoGraphConverter.toData(jsonName)
  }

  boolString2Bool (strBool) {
    if (!strBool) {
      return false
    }
    return strBool.toLowerCase() === 'true'
  }

  numberString2Number (strNum) {
    if (!strNum) {
      return 1
    }
    return Number(strNum)
  }

  _makeGraphQuery (graphType, query, keys) {
    const graphQuery = {}
    for (const [key, keyType] of keys) {
      if (keyType === 'number') {
        graphQuery[key] = this.numberString2Number(query[key])
      } else if (keyType === 'bool') {
        graphQuery[key] = this.boolString2Bool(query[key])
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

  async _getDependencyGraphData (jsonName, req) {
    const graphQuery = this._makeGraphQuery('dependency', req.query, [
      ['target', 'string']
    ])
    graphQuery.graphData = await this.convertTopoGraphData(jsonName)
    return convertDependencyGraphData(graphQuery)
  }

  async _getNestedGraphData (jsonName, req) {
    const graphQuery = this._makeGraphQuery('nested', req.query, [
      ['reverse', 'bool'],
      ['depth', 'number'],
      ['target', 'string'],
      ['layer', 'string']
    ])
    graphQuery.graphData = await this.convertTopoGraphData(jsonName)
    graphQuery.layoutData = await this.readLayoutJSON(jsonName)
    return convertNestedGraphData(graphQuery)
  }

  async getGraphData (req) {
    const graphName = req.params.graphName
    const jsonName = req.params.jsonName

    if (graphName === 'topology') {
      return JSON.stringify(await this.convertTopoGraphData(jsonName))
    } else if (graphName === 'dependency') {
      return JSON.stringify(await this._getDependencyGraphData(jsonName, req))
    } else if (graphName === 'nested') {
      return JSON.stringify(await this._getNestedGraphData(jsonName, req))
    }
  }

  async postGraphData (req) {
    const layoutData = req.body
    const graphName = req.params.graphName // TODO: 404 if graphName != nested
    const jsonName = req.params.jsonName
    const reverse = this.boolString2Bool(req.query.reverse)

    const layoutJsonName = `${jsonName.split('.').shift()}-layout.json`
    const layoutJsonPath = `${this.modelDir}/${layoutJsonName}`
    // const cacheLayoutJsonPath = `${this.cacheDir}/${layoutJsonName}` // test
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
