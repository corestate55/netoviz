import fs from 'fs'
import TopoGraphConverter from './graph/topo-graph/converter'
import DepGraphConverter from './graph/dependency/converter'
import NestedGraphConverter from './graph/nested/converter'
import { promisify } from 'util'

const readFile = promisify(fs.readFile)

export default class TopoogyDataAPI {
  constructor (mode) {
    this.timeStampOf = {} // timestamp table
    const prodDistDir = 'dist'
    const devDistDir = 'public'
    const distDir = mode === 'production' ? prodDistDir : devDistDir
    this.modelDir = `${distDir}/model`
    this.cacheDir = prodDistDir // always use prod dist dir for cache
    this.checkCacheDir()
  }

  checkCacheDir () {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir)
    }
  }

  async readCache () {
    console.log('use cache: ', this.cacheJsonPath)
    try {
      return await readFile(this.cacheJsonPath, 'utf8')
    } catch (error) {
      throw error
    }
  }

  async readTopologyDataFromJSON () {
    try {
      return await readFile(this.jsonPath, 'utf8')
    } catch (error) {
      throw error
    }
  }

  writeCache (resJsonString) {
    console.log('create cache: ', this.cacheJsonPath)
    fs.writeFile(this.cacheJsonPath, resJsonString, 'utf8', (error) => {
      if (error) {
        throw error
      }
      console.log(`cache saved: ${this.cacheJsonPath}`)
    })
  }

  updateStatsOfTopoJSON (jsonName) {
    this.jsonPath = `${this.modelDir}/${jsonName}`
    this.cacheJsonPath = `${this.cacheDir}/${jsonName}.cache`
    this.timeStamp = fs.statSync(this.jsonPath)
  }

  foundCache () {
    return this.timeStampOf[this.jsonPath] &&
      this.timeStampOf[this.jsonPath] === this.timeStamp.mtimeMs
  }

  updateCacheTimeStamp () {
    this.timeStampOf[this.jsonPath] = this.timeStamp.mtimeMs
  }

  async convertTopoGraphData (jsonName) {
    this.updateStatsOfTopoJSON(jsonName)
    console.log('Requested: ', this.jsonPath)

    let resJsonString = '' // stringified json (NOT object)
    if (this.foundCache()) {
      resJsonString = await this.readCache()
    } else {
      // the json file was changed.
      this.updateCacheTimeStamp()
      const data = await this.readTopologyDataFromJSON()
      const topoGraphConverter = new TopoGraphConverter(JSON.parse(data))
      resJsonString = JSON.stringify(topoGraphConverter.toData())
      this.writeCache(resJsonString)
    }
    return resJsonString
  }

  async convertDependencyGraphData (jsonName) {
    const topoJsonString = await this.convertTopoGraphData(jsonName)
    const depGraphConverter = new DepGraphConverter(JSON.parse(topoJsonString))
    return JSON.stringify(depGraphConverter.toData())
  }

  async readLayoutJSON (jsonName) {
    try {
      const baseName = jsonName.split('.').shift()
      const layoutJsonName = `${this.modelDir}/${baseName}-layout.json`
      return await readFile(layoutJsonName, 'utf-8')
    } catch (error) {
      // layout file is optional.
      // when error (not found the file), use default layout.
      const errorLayoutData = {
        shallow: {
          reverse: { error: true },
          standard: { error: true }
        },
        deep: {
          reverse: { error: true },
          standard: { error: true }
        }
      }
      return JSON.stringify(errorLayoutData)
    }
  }

  async convertNestedGraphData (jsonName, reverse, deep) {
    const topoJsonString = await this.convertTopoGraphData(jsonName)
    const layoutJsonString = await this.readLayoutJSON(jsonName)
    const nestedGraphConverter = new NestedGraphConverter(
      JSON.parse(topoJsonString), JSON.parse(layoutJsonString),
      reverse, deep
    )
    return JSON.stringify(nestedGraphConverter.toData())
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
        return await this.convertDependencyGraphData(jsonName)
      } else if (graphName === 'nested') {
        const reverse = this.boolString2Bool(req.query.reverse)
        const deep = this.boolString2Bool(req.query.deep)
        console.log(`call nested: reverse=${reverse}, deep=${deep}`)
        return await this.convertNestedGraphData(jsonName, reverse, deep)
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
