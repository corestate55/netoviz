import fs from 'fs'
import Graphs from './graph/graphs'
import DepGraphConverter from './dep-graph-converter'

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

  readCache () {
    console.log('use cache: ', this.cacheJsonPath)
    return fs.readFileSync(this.cacheJsonPath, 'utf8')
  }

  readTopologyDataFromJSON () {
    const topoData = JSON.parse(fs.readFileSync(this.jsonPath, 'utf8'))
    const graphs = new Graphs(topoData)
    return JSON.stringify(graphs.graphs)
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

  updateStatsOfTopoJSON (req) {
    this.jsonName = req.params.jsonName
    this.jsonPath = `${this.modelDir}/${this.jsonName}`
    this.cacheJsonPath = `${this.cacheDir}/${this.jsonName}.cache`
    this.timeStamp = fs.statSync(this.jsonPath)
  }

  foundCache () {
    return this.timeStampOf[this.jsonPath] &&
      this.timeStampOf[this.jsonPath] === this.timeStamp.mtimeMs
  }

  updateCacheTimeStamp () {
    this.timeStampOf[this.jsonPath] = this.timeStamp.mtimeMs
  }

  convertTopoGraphData (req) {
    this.updateStatsOfTopoJSON(req)
    console.log('Requested: ', this.jsonPath)

    let resJsonString = '' // stringified json (NOT object)
    if (this.foundCache()) {
      resJsonString = this.readCache()
    } else {
      // the json file was changed.
      this.updateCacheTimeStamp()
      resJsonString = this.readTopologyDataFromJSON()
      this.writeCache(resJsonString)
    }
    return resJsonString
  }

  convertDependencyGraphData (req) {
    const topoJsonString = this.convertTopoGraphData(req)
    const depGraph = new DepGraphConverter(JSON.parse(topoJsonString))
    return JSON.stringify(depGraph.toData())
  }
}
