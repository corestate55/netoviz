import fs from 'fs'
import CacheTopoGraphConverter from './cache-topo-graph-converter'
import convertDependencyGraphData from './graph/dependency/converter'
import convertNestedGraphData from './graph/nested/converter'
import { promisify } from 'util'

const readFile = promisify(fs.readFile)

export default class TopoogyDataAPI {
  constructor (mode) {
    const prodDistDir = 'dist'
    const devDistDir = 'public'
    const distDir = mode === 'production' ? prodDistDir : devDistDir
    this.modelDir = `${distDir}/model`
    // always use prod dist dir for cache
    this.topoGraphConverter = new CacheTopoGraphConverter(this.modelDir, prodDistDir)
  }

  async readLayoutJSON (jsonName) {
    try {
      const baseName = jsonName.split('.').shift()
      const layoutJsonName = `${this.modelDir}/${baseName}-layout.json`
      return await readFile(layoutJsonName, 'utf-8')
    } catch (error) {
      console.log(`Layout file correspond with ${jsonName} was not found.`)
      // layout file is optional.
      // when found (layout file was not found), use default layout.
      return JSON.stringify(null)
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

  async getGraphData (req) {
    const graphName = req.params.graphName
    const jsonName = req.params.jsonName
    try {
      if (graphName === 'topology') {
        return await this.convertTopoGraphData(jsonName)
      } else if (graphName === 'dependency') {
        return await convertDependencyGraphData(
          async () => this.convertTopoGraphData(jsonName)
        )
      } else if (graphName === 'nested') {
        const reverse = this.boolString2Bool(req.query.reverse)
        const deep = this.boolString2Bool(req.query.deep)
        console.log(`call nested: reverse=${reverse}, deep=${deep}`)
        return await convertNestedGraphData(reverse, deep,
          async () => this.convertTopoGraphData((jsonName)),
          async () => this.readLayoutJSON(jsonName)
        )
      }
    } catch (error) {
      throw error
    }
  }

  async postGraphData (req) {
    const layoutData = req.body
    const graphName = req.params.graphName
    const jsonName = req.params.jsonName
    // TODO: 404 if graphName != nested
    const reverse = this.boolString2Bool(req.query.reverse)
    const deep = this.boolString2Bool(req.query.deep)

    const layoutJsonName = `${jsonName.split('.').shift()}-layout.json`
    const layoutJsonPath = `${this.modelDir}/${layoutJsonName}`
    // const cacheLayoutJsonPath = `${this.cacheDir}/${layoutJsonName}` // test
    const cacheLayoutJsonPath = layoutJsonPath // overwrite

    console.log(`receive ${graphName}/${jsonName}?reverse=${reverse}&deep=${deep}): `, layoutData)
    const baseLayoutData = JSON.parse(await readFile(layoutJsonPath, 'utf8'))
    const layoutKey = deep ? 'deep' : 'shallow'
    const reverseKey = reverse ? 'reverse' : 'standard'
    baseLayoutData[layoutKey][reverseKey].grid = layoutData
    const layoutDataString = JSON.stringify(baseLayoutData, null, 2) // pretty print
    fs.writeFile(cacheLayoutJsonPath, layoutDataString, 'utf8', (error) => {
      if (error) {
        throw error
      }
      console.log(`layout cache saved: ${cacheLayoutJsonPath}`)
    })
  }
}
